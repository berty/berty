package bertymessenger

import (
	"context"
	"errors"
	"fmt"
	"io"
	"testing"
	"testing/synctest"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	weshnet_errcode "berty.tech/weshnet/v2/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

type fakeSubscriptionStream[T subscriptionEvent] struct {
	grpc.ClientStream
	ctx      context.Context
	events   []T
	errAfter error
}

func (s *fakeSubscriptionStream[T]) Recv() (T, error) {
	var zero T
	if len(s.events) != 0 {
		event := s.events[0]
		s.events = s.events[1:]
		return event, nil
	}
	if s.errAfter != nil {
		return zero, s.errAfter
	}
	<-s.ctx.Done()
	return zero, s.ctx.Err()
}

func TestSubscriptionMessages(t *testing.T) {
	testSubscription(t, func(id string) *protocoltypes.GroupMessageEvent {
		return &protocoltypes.GroupMessageEvent{EventContext: &protocoltypes.EventContext{Id: []byte(id)}}
	})
}

func TestSubscriptionMetadata(t *testing.T) {
	testSubscription(t, func(id string) *protocoltypes.GroupMetadataEvent {
		return &protocoltypes.GroupMetadataEvent{EventContext: &protocoltypes.EventContext{Id: []byte(id)}}
	})
}

// Exercise the same recovery contract with both actual protocol event types.
func testSubscription[T subscriptionEvent](t *testing.T, event func(string) T) {
	t.Run("reconnect and reconcile interleaved history", func(t *testing.T) {
		synctest.Test(t, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			var handled []string
			var previous context.Context
			calls := 0
			connect := func(streamCtx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error) {
				if previous != nil {
					require.ErrorIs(t, previous.Err(), context.Canceled, "previous attempt must be closed")
				}
				previous = streamCtx
				calls++
				s := &fakeSubscriptionStream[T]{ctx: streamCtx}
				switch calls {
				case 1: // Initial connection failures must also retry.
					require.Equal(t, "seed", string(sinceID))
					require.True(t, untilNow)
					return nil, errors.New("offline")
				case 2:
					require.Equal(t, "seed", string(sinceID))
					require.True(t, untilNow)
					s.events = []T{event("seed"), event("history")}
					s.errAfter = io.EOF
				case 3:
					require.Equal(t, "history", string(sinceID))
					require.False(t, untilNow)
					// A new live event overtakes a historical event not received yet.
					s.events = []T{event("history"), event("newer"), event("newer")}
					s.errAfter = io.ErrUnexpectedEOF
				case 4:
					require.Equal(t, "history", string(sinceID), "live receipt must not skip the gap")
					require.True(t, untilNow)
					s.events = []T{event("history"), event("missed"), event("newer")}
					s.errAfter = io.EOF
				case 5:
					require.Equal(t, "newer", string(sinceID))
					require.False(t, untilNow)
					s.events = []T{event("newer"), event("last")}
				default:
					t.Fatal("unexpected reconnect")
				}
				return s, nil
			}
			runSubscription(ctx, zap.NewNop(), []byte("seed"), connect, func(e T) error {
				id := string(e.GetEventContext().GetId())
				handled = append(handled, id)
				if id == "last" {
					cancel()
				}
				return nil
			})
			require.Equal(t, []string{"history", "newer", "missed", "last"}, handled)
			require.Equal(t, 5, calls)
			require.ErrorIs(t, previous.Err(), context.Canceled)
		})
	})

	t.Run("interrupted replay and handler retry", func(t *testing.T) {
		synctest.Test(t, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			var handled []string
			calls, handlerAttempts := 0, 0
			connect := func(streamCtx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error) {
				calls++
				s := &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: io.EOF}
				switch calls {
				case 1:
					require.Nil(t, sinceID)
					var sentinel T // Generated GetEventContext methods are nil-safe.
					s.events = []T{sentinel, event(""), event("one")}
					s.errAfter = io.ErrUnexpectedEOF
				case 2, 3:
					require.True(t, untilNow)
					require.Equal(t, "one", string(sinceID))
					s.events = []T{event("one"), event("two"), event("three")}
				case 4:
					require.False(t, untilNow)
					require.Equal(t, "three", string(sinceID))
					cancel()
				default:
					t.Fatal("unexpected reconnect")
				}
				return s, nil
			}
			runSubscription(ctx, zap.NewNop(), nil, connect, func(e T) error {
				id := string(e.GetEventContext().GetId())
				if id == "two" {
					handlerAttempts++
					if handlerAttempts == 1 {
						return errors.New("temporary database failure")
					}
				}
				handled = append(handled, id)
				return nil
			})
			require.Equal(t, []string{"one", "two", "three"}, handled)
			require.Equal(t, 2, handlerAttempts)
		})
	})

	t.Run("live handler failure keeps checkpoint", func(t *testing.T) {
		synctest.Test(t, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			calls, attempts := 0, 0
			connect := func(streamCtx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error) {
				calls++
				require.Equal(t, "seed", string(sinceID))
				s := &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: io.EOF}
				switch calls {
				case 1:
					require.True(t, untilNow)
				case 2:
					require.False(t, untilNow)
					s.events = []T{event("failed")}
				case 3:
					require.True(t, untilNow)
					s.events = []T{event("failed")}
				default:
					t.Fatal("unexpected reconnect")
				}
				return s, nil
			}
			runSubscription(ctx, zap.NewNop(), []byte("seed"), connect, func(T) error {
				attempts++
				if attempts == 1 {
					return errors.New("temporary database failure")
				}
				cancel()
				return nil
			})
			require.Equal(t, 2, attempts)
		})
	})

	t.Run("unavailable persisted cursor", func(t *testing.T) {
		synctest.Test(t, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			calls := 0
			connect := func(streamCtx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error) {
				calls++
				require.True(t, untilNow)
				if calls == 1 {
					require.Equal(t, "missing", string(sinceID))
					return &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: weshnet_errcode.ErrCode_ErrInvalidRange}, nil
				}
				require.Nil(t, sinceID)
				return &fakeSubscriptionStream[T]{ctx: streamCtx, events: []T{event("recovered")}}, nil
			}
			runSubscription(ctx, zap.NewNop(), []byte("missing"), connect, func(T) error { cancel(); return nil })
			require.Equal(t, 2, calls)
		})
	})

	t.Run("canceled before startup", func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		cancel()
		connect := func(context.Context, []byte, bool) (subscriptionStream[T], error) {
			t.Fatal("must not connect after cancellation")
			return nil, nil
		}
		runSubscription(ctx, zap.NewNop(), nil, connect, func(T) error { return nil })
	})

	for _, failure := range []string{"open", "replay receive", "live receive", "live EOF"} {
		t.Run("backoff on "+failure, func(t *testing.T) {
			synctest.Test(t, func(t *testing.T) {
				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()
				var attempts []time.Time
				connect := func(streamCtx context.Context, _ []byte, untilNow bool) (subscriptionStream[T], error) {
					if (failure == "live receive" || failure == "live EOF") && untilNow {
						return &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: io.EOF}, nil
					}
					attempts = append(attempts, time.Now())
					if len(attempts) == 9 {
						cancel()
					}
					if failure == "open" {
						return nil, errors.New("offline")
					}
					recvErr := io.ErrUnexpectedEOF
					if failure == "live EOF" {
						recvErr = io.EOF
					}
					return &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: recvErr}, nil
				}
				runSubscription(ctx, zap.NewNop(), nil, connect, func(T) error { t.Fatal("unexpected event"); return nil })
				require.Len(t, attempts, 9)
				for i := 1; i < len(attempts); i++ {
					cap := min(subscriptionMinRetryDelay*time.Duration(1<<(i-1)), subscriptionMaxRetryDelay)
					delta := attempts[i].Sub(attempts[i-1])
					require.GreaterOrEqual(t, delta, cap/2)
					require.Less(t, delta, cap)
				}
			})
		})
	}

	for _, recovery := range []string{"processed event", "stable connection"} {
		t.Run("reset backoff after "+recovery, func(t *testing.T) {
			synctest.Test(t, func(t *testing.T) {
				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()
				calls := 0
				var recoveredAt time.Time
				connect := func(streamCtx context.Context, _ []byte, _ bool) (subscriptionStream[T], error) {
					calls++
					switch calls {
					case 1, 2, 3:
						return nil, errors.New("offline")
					case 4:
						if recovery == "stable connection" {
							time.Sleep(subscriptionMaxRetryDelay)
							recoveredAt = time.Now()
							return nil, errors.New("connection lost after being stable")
						}
						return &fakeSubscriptionStream[T]{ctx: streamCtx, events: []T{event("progress")}, errAfter: io.ErrUnexpectedEOF}, nil
					case 5:
						delta := time.Since(recoveredAt)
						require.GreaterOrEqual(t, delta, subscriptionMinRetryDelay/2)
						require.Less(t, delta, subscriptionMinRetryDelay)
						cancel()
						return nil, context.Canceled
					default:
						t.Fatal("unexpected reconnect")
						return nil, nil
					}
				}
				runSubscription(ctx, zap.NewNop(), nil, connect, func(T) error { recoveredAt = time.Now(); return nil })
				require.Equal(t, 5, calls)
			})
		})
	}

	for _, blocked := range []string{"receive", "backoff"} {
		t.Run("cancel during "+blocked, func(t *testing.T) {
			synctest.Test(t, func(t *testing.T) {
				ctx, cancel := context.WithCancel(context.Background())
				defer cancel()
				calls := 0
				var attemptCtx context.Context
				connect := func(streamCtx context.Context, _ []byte, _ bool) (subscriptionStream[T], error) {
					calls++
					attemptCtx = streamCtx
					if blocked == "backoff" {
						return nil, errors.New("offline")
					}
					return &fakeSubscriptionStream[T]{ctx: streamCtx}, nil
				}
				done := make(chan struct{})
				go func() {
					defer close(done)
					runSubscription(ctx, zap.NewNop(), nil, connect, func(T) error { return nil })
				}()
				synctest.Wait()
				cancel()
				synctest.Wait()
				select {
				case <-done:
				default:
					t.Fatal("subscription did not stop")
				}
				require.Equal(t, 1, calls)
				require.ErrorIs(t, attemptCtx.Err(), context.Canceled)
			})
		})
	}

	t.Run("refresh checkpoint without duplicate delivery", func(t *testing.T) {
		synctest.Test(t, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			batch := make([]T, subscriptionCheckpointInterval)
			for i := range batch {
				batch[i] = event(fmt.Sprint(i))
			}
			calls, handled := 0, 0
			connect := func(streamCtx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[T], error) {
				calls++
				s := &fakeSubscriptionStream[T]{ctx: streamCtx, errAfter: io.EOF}
				switch calls {
				case 1:
					require.True(t, untilNow)
				case 2:
					require.False(t, untilNow)
					s.events = batch
				case 3:
					require.True(t, untilNow)
					require.Nil(t, sinceID)
					s.events = batch
				case 4:
					require.False(t, untilNow)
					require.Equal(t, fmt.Sprint(len(batch)-1), string(sinceID))
					cancel()
				default:
					t.Fatal("unexpected reconnect")
				}
				return s, nil
			}
			runSubscription(ctx, zap.NewNop(), nil, connect, func(T) error { handled++; return nil })
			require.Equal(t, len(batch), handled)
		})
	})
}

type fakeProtocolClient struct {
	protocoltypes.ProtocolServiceClient
	groupMessageList  func(context.Context, *protocoltypes.GroupMessageList_Request) (protocoltypes.ProtocolService_GroupMessageListClient, error)
	groupMetadataList func(context.Context, *protocoltypes.GroupMetadataList_Request) (protocoltypes.ProtocolService_GroupMetadataListClient, error)
}

func (f *fakeProtocolClient) GroupMessageList(ctx context.Context, req *protocoltypes.GroupMessageList_Request, _ ...grpc.CallOption) (protocoltypes.ProtocolService_GroupMessageListClient, error) {
	return f.groupMessageList(ctx, req)
}

func (f *fakeProtocolClient) GroupMetadataList(ctx context.Context, req *protocoltypes.GroupMetadataList_Request, _ ...grpc.CallOption) (protocoltypes.ProtocolService_GroupMetadataListClient, error) {
	return f.groupMetadataList(ctx, req)
}

func TestSubscriptionConnectors(t *testing.T) {
	for _, untilNow := range []bool{false, true} {
		for _, cursor := range [][]byte{nil, []byte("cursor")} {
			t.Run(fmt.Sprintf("bounded=%v/cursor=%s", untilNow, cursor), func(t *testing.T) {
				ctx := context.Background()
				gpkb := []byte("group")
				boom := errors.New("connection failed")
				messageCalls, metadataCalls := 0, 0
				svc := &service{protocolClient: &fakeProtocolClient{
					groupMessageList: func(gotCtx context.Context, req *protocoltypes.GroupMessageList_Request) (protocoltypes.ProtocolService_GroupMessageListClient, error) {
						messageCalls++
						require.Equal(t, ctx, gotCtx)
						require.Equal(t, gpkb, req.GroupPk)
						require.Equal(t, cursor, req.SinceId)
						require.Equal(t, untilNow, req.UntilNow)
						require.False(t, req.SinceNow, "must backfill the connection gap even with no cursor")
						return nil, boom
					},
					groupMetadataList: func(gotCtx context.Context, req *protocoltypes.GroupMetadataList_Request) (protocoltypes.ProtocolService_GroupMetadataListClient, error) {
						metadataCalls++
						require.Equal(t, ctx, gotCtx)
						require.Equal(t, gpkb, req.GroupPk)
						require.Equal(t, cursor, req.SinceId)
						require.Equal(t, untilNow, req.UntilNow)
						require.False(t, req.SinceNow)
						return nil, boom
					},
				}}
				_, err := svc.connectGroupMessages(ctx, gpkb, cursor, untilNow)
				require.ErrorIs(t, err, boom)
				_, err = svc.connectGroupMetadata(ctx, gpkb, cursor, untilNow)
				require.ErrorIs(t, err, boom)
				require.Equal(t, 1, messageCalls)
				require.Equal(t, 1, metadataCalls)
			})
		}
	}
}
