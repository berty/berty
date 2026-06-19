package bertymessenger

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

// fakeGroupMessageStream yields queued events in order, then returns errAfter or (if block) tails until ctx is done.
// It embeds the grpc client-stream interface (nil) so it also satisfies the GroupMessageListClient type; only Recv is used.
type fakeGroupMessageStream struct {
	grpc.ServerStreamingClient[protocoltypes.GroupMessageEvent]

	mu       sync.Mutex
	events   []*protocoltypes.GroupMessageEvent
	idx      int
	errAfter error
	block    bool
	ctx      context.Context
}

func (f *fakeGroupMessageStream) Recv() (*protocoltypes.GroupMessageEvent, error) {
	f.mu.Lock()
	if f.idx < len(f.events) {
		e := f.events[f.idx]
		f.idx++
		f.mu.Unlock()
		return e, nil
	}
	f.mu.Unlock()

	if f.block {
		<-f.ctx.Done()
		return nil, f.ctx.Err()
	}
	return nil, f.errAfter
}

func mkGroupMessageEvent(id string) *protocoltypes.GroupMessageEvent {
	return &protocoltypes.GroupMessageEvent{
		EventContext: &protocoltypes.EventContext{Id: []byte(id)},
		Message:      []byte(id),
	}
}

// TestStreamGroupMessagesReconnectBackfill: on stream failure, reconnect, resume from the last handled id, keep delivering.
func TestStreamGroupMessagesReconnectBackfill(t *testing.T) {
	svc := &service{logger: zap.NewNop()}
	gpkb := []byte("group-pk")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// First stream delivers m1, m2 then fails; the reconnect delivers the missed m3, then tails.
	stream1 := &fakeGroupMessageStream{
		events:   []*protocoltypes.GroupMessageEvent{mkGroupMessageEvent("m1"), mkGroupMessageEvent("m2")},
		errAfter: errors.New("stream boom"),
	}
	stream2 := &fakeGroupMessageStream{
		events: []*protocoltypes.GroupMessageEvent{mkGroupMessageEvent("m3")},
		block:  true,
		ctx:    ctx,
	}

	var mu sync.Mutex
	var handled []string
	var sinceIDs [][]byte
	connectCalls := 0

	connect := func(_ context.Context, _, sinceID []byte) (groupMessageStream, error) {
		mu.Lock()
		defer mu.Unlock()
		connectCalls++
		sinceIDs = append(sinceIDs, append([]byte(nil), sinceID...))
		return stream2, nil
	}
	handle := func(_ []byte, gme *protocoltypes.GroupMessageEvent) {
		mu.Lock()
		defer mu.Unlock()
		handled = append(handled, string(gme.GetEventContext().GetId()))
	}

	done := make(chan struct{})
	go func() {
		// no seed cursor: cursor is established from the live messages (m1, m2)
		svc.streamGroupMessages(ctx, gpkb, stream1, nil, connect, handle)
		close(done)
	}()

	require.Eventually(t, func() bool {
		mu.Lock()
		defer mu.Unlock()
		return len(handled) >= 3
	}, 5*time.Second, 10*time.Millisecond)

	cancel()
	<-done

	mu.Lock()
	defer mu.Unlock()
	require.Equal(t, []string{"m1", "m2", "m3"}, handled)
	require.Equal(t, 1, connectCalls)
	// reconnection must resume right after the last handled message (m2)
	require.Equal(t, [][]byte{[]byte("m2")}, sinceIDs)
}

// TestStreamGroupMessagesSeedCursor: a drop before any live message reconnects using the DB-seeded cursor.
func TestStreamGroupMessagesSeedCursor(t *testing.T) {
	svc := &service{logger: zap.NewNop()}
	gpkb := []byte("group-pk")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	stream1 := &fakeGroupMessageStream{errAfter: errors.New("stream boom")} // fails immediately
	stream2 := &fakeGroupMessageStream{
		events: []*protocoltypes.GroupMessageEvent{mkGroupMessageEvent("seeded")},
		block:  true,
		ctx:    ctx,
	}

	var mu sync.Mutex
	var sinceIDs [][]byte
	var handled []string

	connect := func(_ context.Context, _, sinceID []byte) (groupMessageStream, error) {
		mu.Lock()
		defer mu.Unlock()
		sinceIDs = append(sinceIDs, append([]byte(nil), sinceID...))
		return stream2, nil
	}
	handle := func(_ []byte, gme *protocoltypes.GroupMessageEvent) {
		mu.Lock()
		defer mu.Unlock()
		handled = append(handled, string(gme.GetEventContext().GetId()))
	}

	done := make(chan struct{})
	go func() {
		svc.streamGroupMessages(ctx, gpkb, stream1, []byte("seed-cursor"), connect, handle)
		close(done)
	}()

	require.Eventually(t, func() bool {
		mu.Lock()
		defer mu.Unlock()
		return len(handled) >= 1
	}, 5*time.Second, 10*time.Millisecond)

	cancel()
	<-done

	mu.Lock()
	defer mu.Unlock()
	require.Equal(t, [][]byte{[]byte("seed-cursor")}, sinceIDs)
}

// TestDrainBoundedStream: the drain handles every event of a non-tailing stream, skipping sentinels.
func TestDrainBoundedStream(t *testing.T) {
	svc := &service{logger: zap.NewNop()}
	gpkb := []byte("group-pk")

	stream := &fakeGroupMessageStream{
		events: []*protocoltypes.GroupMessageEvent{
			mkGroupMessageEvent("h1"),
			{EventContext: nil}, // sentinel: must be skipped
			mkGroupMessageEvent("h2"),
			mkGroupMessageEvent("h3"),
		},
		errAfter: errors.New("EOF"), // bounded stream ends after the queued events
	}

	var handled []string
	count := svc.drainBoundedStream(gpkb, stream, func(_ []byte, gme *protocoltypes.GroupMessageEvent) {
		handled = append(handled, string(gme.GetEventContext().GetId()))
	})

	require.Equal(t, 3, count)
	require.Equal(t, []string{"h1", "h2", "h3"}, handled)
}

// fakeProtocolClient implements only GroupMessageList; other calls hit the nil embedded interface.
type fakeProtocolClient struct {
	protocoltypes.ProtocolServiceClient

	groupMessageList func(ctx context.Context, req *protocoltypes.GroupMessageList_Request) (protocoltypes.ProtocolService_GroupMessageListClient, error)
}

func (f *fakeProtocolClient) GroupMessageList(ctx context.Context, req *protocoltypes.GroupMessageList_Request, _ ...grpc.CallOption) (protocoltypes.ProtocolService_GroupMessageListClient, error) {
	return f.groupMessageList(ctx, req)
}

// TestReconcileGroupMessagesRequest: the startup pass requests a bounded backfill (SinceId == cursor, UntilNow) and replays it.
func TestReconcileGroupMessagesRequest(t *testing.T) {
	gpkb := []byte("group-pk")
	cursor := []byte("last-indexed-cid")

	var gotReq *protocoltypes.GroupMessageList_Request
	fakeClient := &fakeProtocolClient{
		groupMessageList: func(_ context.Context, req *protocoltypes.GroupMessageList_Request) (protocoltypes.ProtocolService_GroupMessageListClient, error) {
			gotReq = req
			return &fakeGroupMessageStream{
				events:   []*protocoltypes.GroupMessageEvent{mkGroupMessageEvent("r1"), mkGroupMessageEvent("r2")},
				errAfter: errors.New("EOF"), // bounded stream ends at the head
			}, nil
		},
	}

	svc := &service{logger: zap.NewNop(), protocolClient: fakeClient}

	var handled []string
	svc.reconcileGroupMessages(context.Background(), gpkb, cursor, func(_ []byte, gme *protocoltypes.GroupMessageEvent) {
		handled = append(handled, string(gme.GetEventContext().GetId()))
	})

	require.NotNil(t, gotReq)
	require.Equal(t, gpkb, gotReq.GroupPk)
	require.Equal(t, cursor, gotReq.SinceId)
	require.True(t, gotReq.UntilNow, "reconciliation must be bounded (UntilNow)")
	require.False(t, gotReq.SinceNow, "reconciliation must resume from the cursor, not tail from now")
	require.Equal(t, []string{"r1", "r2"}, handled)
}

// TestReconnectGroupMessagesCancel: the reconnect loop gives up when ctx is canceled mid-retry.
func TestReconnectGroupMessagesCancel(t *testing.T) {
	svc := &service{logger: zap.NewNop()}

	ctx, cancel := context.WithCancel(context.Background())

	var calls int32
	var mu sync.Mutex
	connect := func(_ context.Context, _, _ []byte) (groupMessageStream, error) {
		mu.Lock()
		calls++
		if calls == 1 {
			cancel() // cancel right after the first failed attempt
		}
		mu.Unlock()
		return nil, errors.New("still down")
	}

	got := svc.reconnectGroupMessages(ctx, []byte("g"), nil, connect)
	require.Nil(t, got)
}
