package bertyprotocol

import (
	"context"
	"fmt"
	"io"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/metadata"
)

func TestScenario_JoinGroup_Service(t *testing.T) {
	const numberOfService = 2

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	opts := TestingOpts{
		Logger: testutil.Logger(t),
	}

	// Setup test
	pts, cleanup := generateTestingProtocol(ctx, t, &opts, numberOfService)
	defer cleanup()

	// connect all pts together
	for _, pt := range pts {
		err := pt.IPFS.MockNetwork().ConnectAllButSelf()
		require.NoError(t, err)
	}

	// create group
	group, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// Run test

	t.Log("Get Instance Configuration")
	{
		start := time.Now()
		req := bertytypes.InstanceGetConfiguration_Request{}

		// check if everything is ready
		for _, pt := range pts {
			_, err := pt.Service.InstanceGetConfiguration(ctx, &req)
			require.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Join Group")
	{
		start := time.Now()
		req := bertytypes.MultiMemberGroupJoin_Request{
			Group: group,
		}

		for _, pt := range pts {
			// pt join group
			_, err = pt.Service.MultiMemberGroupJoin(ctx, &req)
			require.NoError(t, err)

			// pt join group
			_, err = pt.Service.MultiMemberGroupJoin(ctx, &req)
			assert.Error(t, err)

		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Get Group Info")
	{
		start := time.Now()
		req := bertytypes.GroupInfo_Request{
			GroupPK: group.PublicKey,
		}

		for _, pt := range pts {
			res, err := pt.Service.GroupInfo(ctx, &req)
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Activate Group")
	{
		start := time.Now()
		req := bertytypes.ActivateGroup_Request{
			GroupPK: group.PublicKey,
		}

		for _, pt := range pts {
			_, err := pt.Service.ActivateGroup(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	cmsgs := make([]chan *bertytypes.GroupMessageEvent, numberOfService)
	t.Log("Subscribe to Group Message")
	{
		start := time.Now()
		req := &bertytypes.GroupMessageSubscribe_Request{GroupPK: group.PublicKey}

		for i, pt := range pts {
			msgs, srvListMessages := newProtocolServiceGroupMessage(ctx)

			// Watch for incoming new messages
			go func() {
				err := pt.Service.GroupMessageSubscribe(req, srvListMessages)
				assert.NoError(t, err)
			}()

			cmsgs[i] = msgs
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	// clsGroupMetadata := make([]ProtocolService_GroupMetadataSubscribeService, numberOfService)
	// t.Log("Subscribe to Group Metadata")
	// {
	// 	start := time.Now()
	// 	req := bertytypes.GroupMetadataSubscribe_Request{
	// 		GroupPK: group.PublicKey,
	// 	}

	// 	for i, pt := range pts {
	// 		var err error

	// 		clsGroupMetadata[i], err = pt.Service.GroupMetadataSubscribe(ctx, &req)
	// 		require.NoError(t, err)
	// 	}
	// 	t.Logf("  duration: %s", time.Since(start))
	// }

	var testMessage = "hello from"
	t.Log("Send Message")
	{
		start := time.Now()

		for i, pt := range pts {
			payload := []byte(fmt.Sprintf("%s %d", testMessage, i))

			req := bertytypes.AppMessageSend_Request{
				GroupPK: group.PublicKey,
				Payload: payload,
			}

			_, err := pt.Service.AppMessageSend(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	testrx := fmt.Sprintf("^%s [\\d]$", testMessage)
	t.Log("List Message")
	{
		start := time.Now()
		req := bertytypes.GroupMessageList_Request{
			GroupPK: group.PublicKey,
		}

		for i, pt := range pts {
			msgs, srvListMessages := newProtocolServiceGroupMessage(ctx)

			go func() {
				err := pt.Service.GroupMessageList(&req, srvListMessages)
				assert.NoError(t, err)
			}()

			j := 0
			for res := range msgs {
				require.Regexp(t, testrx, string(res.GetMessage()), "invalid message content")
				fmt.Println(i, "recv:", string(res.GetMessage()))
				j++
				if j == 2 {
					close(msgs)
				}
			}

			require.Equal(t, 2, len(msgs), "wrong number of messages")
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Receive Message")
	{
		start := time.Now()

		for _, msgs := range cmsgs {
			i := 0
			for res := range msgs {
				require.Regexp(t, testrx, string(res.GetMessage()), "invalid message content")
				i++
				if i == 2 {
					close(msgs)
				}
			}
		}
		t.Logf("  duration: %s", time.Since(start))
	}
}

func TestScenario_JoinGroup_Client(t *testing.T) {
	const numberOfService = 2

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	opts := TestingOpts{
		Logger: testutil.Logger(t),
	}

	// Setup test
	pts, cleanup := generateTestingProtocol(ctx, t, &opts, numberOfService)
	defer cleanup()

	// connect all pts together
	for _, pt := range pts {
		err := pt.IPFS.MockNetwork().ConnectAllButSelf()
		require.NoError(t, err)
	}

	// create group
	group, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// Run test

	t.Log("Get Instance Configuration")
	{
		start := time.Now()
		req := bertytypes.InstanceGetConfiguration_Request{}

		// check if everything is ready
		for _, pt := range pts {
			_, err := pt.Client.InstanceGetConfiguration(ctx, &req)
			require.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Join Group")
	{
		start := time.Now()
		req := bertytypes.MultiMemberGroupJoin_Request{
			Group: group,
		}

		for _, pt := range pts {
			// pt join group
			_, err = pt.Client.MultiMemberGroupJoin(ctx, &req)
			require.NoError(t, err)

			// pt join group
			_, err = pt.Client.MultiMemberGroupJoin(ctx, &req)
			assert.Error(t, err)

		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Get Group Info")
	{
		start := time.Now()
		req := bertytypes.GroupInfo_Request{
			GroupPK: group.PublicKey,
		}

		for _, pt := range pts {
			res, err := pt.Client.GroupInfo(ctx, &req)
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Activate Group")
	{
		start := time.Now()
		req := bertytypes.ActivateGroup_Request{
			GroupPK: group.PublicKey,
		}

		for _, pt := range pts {
			_, err := pt.Client.ActivateGroup(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	clsGroupMessage := make([]ProtocolService_GroupMessageSubscribeClient, numberOfService)
	t.Log("Subscribe to Group Message")
	{
		start := time.Now()
		req := bertytypes.GroupMessageSubscribe_Request{
			GroupPK: group.PublicKey,
		}

		for i, pt := range pts {
			var err error

			clsGroupMessage[i], err = pt.Client.GroupMessageSubscribe(ctx, &req)
			require.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	// client stream are needed to continue this test
	require.NotContains(t, clsGroupMessage, nil)

	clsGroupMetadata := make([]ProtocolService_GroupMetadataSubscribeClient, numberOfService)
	t.Log("Subscribe to Group Metadata")
	{
		start := time.Now()
		req := bertytypes.GroupMetadataSubscribe_Request{
			GroupPK: group.PublicKey,
		}

		for i, pt := range pts {
			var err error

			clsGroupMetadata[i], err = pt.Client.GroupMetadataSubscribe(ctx, &req)
			require.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	// client stream are needed to continue this test
	require.NotContains(t, clsGroupMetadata, nil)

	var testMessage = []byte("hello world")
	t.Log("Send Message")
	{
		start := time.Now()

		for i, pt := range pts {
			payload := []byte(fmt.Sprintf("%s:%d", testMessage, i))

			req := bertytypes.AppMessageSend_Request{
				GroupPK: group.PublicKey,
				Payload: payload,
			}

			_, err := pt.Client.AppMessageSend(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("List Message")
	{
		start := time.Now()
		testrx := fmt.Sprintf("^%s", testMessage)
		req := bertytypes.GroupMessageList_Request{
			GroupPK: group.PublicKey,
		}

		for _, pt := range pts {
			cl, err := pt.Client.GroupMessageList(ctx, &req)
			if !assert.NoError(t, err) {
				continue
			}

			var res *bertytypes.GroupMessageEvent
			for range pts {
				res, err = cl.Recv()
				if err == io.EOF {
					break
				}
				if !assert.NoError(t, err) {
					continue
				}

				assert.Regexp(t, testrx, string(res.GetMessage()))
			}

			assert.Equal(t, err, io.EOF)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Receive Message")
	{
		start := time.Now()
		testrx := fmt.Sprintf("^%s", testMessage)

		for _, cl := range clsGroupMessage {
			res, err := cl.Recv()
			if !assert.NoError(t, err) {
				assert.Regexp(t, testrx, string(res.GetMessage()))
			}
		}
		t.Logf("  duration: %s", time.Since(start))
	}
}

// helper for service

type fakeServerStream struct {
	context context.Context
}

func (f *fakeServerStream) SetHeader(metadata.MD) error {
	panic("implement me")
}

func (f *fakeServerStream) SendHeader(metadata.MD) error {
	panic("implement me")
}

func (f *fakeServerStream) SetTrailer(metadata.MD) {
	panic("implement me")
}

func (f *fakeServerStream) Context() context.Context {
	return f.context
}

func (f *fakeServerStream) SendMsg(m interface{}) error {
	panic("implement me")
}

func (f *fakeServerStream) RecvMsg(m interface{}) error {
	panic("implement me")
}

type protocolServiceGroupMessage struct {
	*fakeServerStream
	ch chan *bertytypes.GroupMessageEvent
}

func (x *protocolServiceGroupMessage) Send(m *bertytypes.GroupMessageEvent) error {
	x.ch <- m
	return nil
}

func newProtocolServiceGroupMessage(ctx context.Context) (chan *bertytypes.GroupMessageEvent, *protocolServiceGroupMessage) {
	ch := make(chan *bertytypes.GroupMessageEvent)

	return ch, &protocolServiceGroupMessage{
		fakeServerStream: &fakeServerStream{
			context: ctx,
		},
		ch: ch,
	}
}
