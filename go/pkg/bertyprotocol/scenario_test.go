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
)

func TestScenario_JoinGroup(t *testing.T) {
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
		req := bertytypes.AppMessageSend_Request{
			GroupPK: group.PublicKey,
			Payload: testMessage,
		}
		for _, pt := range pts {
			_, err := pt.Client.AppMessageSend(ctx, &req)
			assert.NoError(t, err)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("List Message")
	{
		start := time.Now()
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

				assert.Equal(t, res.GetMessage(), testMessage)
			}

			assert.Equal(t, err, io.EOF)
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	t.Log("Receive Message")
	{
		start := time.Now()
		for _, cl := range clsGroupMessage {
			res, err := cl.Recv()
			fmt.Println(res, err)
			if !assert.NoError(t, err) {
				msg := res.GetMessage()
				assert.Equal(t, testMessage, msg)
			}
		}
		t.Logf("  duration: %s", time.Since(start))
	}
}
