package bertyprotocol

import (
	"context"
	"fmt"
	"io"
	"testing"
	"time"

	crand "crypto/rand"

	"sync"

	"bytes"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/metadata"
)

func TestScenario_JoinGroup_Service(t *testing.T) {
	t.Skip()
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

		// check if everything is ready
		for _, pt := range pts {
			req := bertytypes.InstanceGetConfiguration_Request{}

			_, err := pt.Client.InstanceGetConfiguration(ctx, &req)
			require.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Join Group")
	{
		start := time.Now()

		for _, pt := range pts {
			req := bertytypes.MultiMemberGroupJoin_Request{
				Group: group,
			}

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

		for _, pt := range pts {
			req := bertytypes.GroupInfo_Request{
				GroupPK: group.PublicKey,
			}

			res, err := pt.Client.GroupInfo(ctx, &req)
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Activate Group")
	{
		start := time.Now()

		for _, pt := range pts {
			req := bertytypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			}

			_, err := pt.Client.ActivateGroup(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	clsGroupMessage := make([]ProtocolService_GroupMessageSubscribeClient, numberOfService)
	t.Log("Subscribe to Group Message")
	{
		start := time.Now()

		for i, pt := range pts {
			var err error

			req := bertytypes.GroupMessageSubscribe_Request{
				GroupPK: group.PublicKey,
			}

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

		for i, pt := range pts {
			var err error

			req := bertytypes.GroupMetadataSubscribe_Request{
				GroupPK: group.PublicKey,
			}

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

	time.Sleep(time.Millisecond * 500)

	t.Log("List Message")
	{
		start := time.Now()
		testrx := fmt.Sprintf("^%s", testMessage)

		for _, pt := range pts {
			req := bertytypes.GroupMessageList_Request{
				GroupPK: group.PublicKey,
			}

			cl, err := pt.Client.GroupMessageList(ctx, &req)
			if !assert.NoError(t, err) {
				continue
			}

			nmsg := 0
			var res *bertytypes.GroupMessageEvent
			for {
				res, err = cl.Recv()
				if err == io.EOF {
					break
				}
				if !assert.NoError(t, err) {
					continue
				}

				assert.Regexp(t, testrx, string(res.GetMessage()))

				nmsg++
			}

			assert.Equal(t, numberOfService, nmsg)
			assert.Equal(t, io.EOF, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Receive Message")
	{
		start := time.Now()
		testrx := fmt.Sprintf("^%s", testMessage)
		nmsg := 0
		for _, cl := range clsGroupMessage {
			res, err := cl.Recv()
			if !assert.NoError(t, err) {
				assert.Regexp(t, testrx, string(res.GetMessage()))
			}

			nmsg++
		}

		assert.Equal(t, numberOfService, nmsg)
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

func TestScenario_ContactMessage(t *testing.T) {
	const numberOfService = 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	opts := TestingOpts{
		Logger: testutil.Logger(t),
	}

	// Setup test
	pts, cleanup := generateTestingProtocol(ctx, t, &opts, numberOfService)
	defer cleanup()

	pt := pts[0]

	_, otherPK, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherPKBytes, err := otherPK.Raw()
	require.NoError(t, err)

	otherSharableContact, err := proto.Marshal(&bertytypes.ShareableContact{
		PK:                   otherPKBytes,
		PublicRendezvousSeed: bytes.Repeat([]byte("."), bertytypes.RendezvousSeedLength),
		Metadata:             []byte("useless"),
	})
	require.NoError(t, err)

	_, err = pt.Client.ContactRequestSend(ctx, &bertytypes.ContactRequestSend_Request{
		Reference:       otherSharableContact,
		ContactMetadata: nil,
	})
	require.NoError(t, err)

	gInfo, err := pt.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		ContactPK: otherPKBytes,
	})
	require.NoError(t, err)
	require.NotNil(t, gInfo)

	_, err = pt.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
		GroupPK: gInfo.Group.PublicKey,
	})
	require.NoError(t, err)

	expectedMessages := map[string]bool{
		"test1": false,
		"test2": false,
		"test3": false,
		"test4": false,
	}
	expectedMessagesLock := sync.Mutex{}
	expectedMessagesCount := len(expectedMessages)
	expectedMessagesContent := make([]string, expectedMessagesCount)
	i := 0
	for msg := range expectedMessages {
		expectedMessagesContent[i] = msg
		i++
	}

	subCtx, subCancel := context.WithTimeout(ctx, time.Second*5)

	go func() {
		sub, err := pt.Client.GroupMessageSubscribe(subCtx, &bertytypes.GroupMessageSubscribe_Request{
			GroupPK: gInfo.Group.PublicKey,
		})
		require.NoError(t, err)

		for {
			if subCtx.Err() != nil {
				break
			}

			res, err := sub.Recv()
			if err == io.EOF {
				break
			}
			if !assert.NoError(t, err) {
				continue
			}

			expectedMessagesLock.Lock()
			if value, ok := expectedMessages[string(res.Message)]; !ok {
				expectedMessagesLock.Unlock()
				t.Fatalf("unexpected message %s", string(res.Message))
			} else if value {
				expectedMessagesLock.Unlock()
				continue
			}

			expectedMessages[string(res.Message)] = true
			expectedMessagesCount--
			expectedMessagesLock.Unlock()

			if expectedMessagesCount == 0 {
				subCancel()
				break
			}
		}

		subCancel()
	}()

	for _, msg := range expectedMessagesContent {
		_, err := pt.Client.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
			GroupPK: gInfo.Group.PublicKey,
			Payload: []byte(msg),
		})

		require.NoError(t, err)
	}

	<-subCtx.Done()

	for msg, ok := range expectedMessages {
		assert.True(t, ok, msg)
	}
}
