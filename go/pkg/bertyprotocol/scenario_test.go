package bertyprotocol

import (
	"context"
	"fmt"
	"io"
	"strconv"
	"testing"
	"time"

	crand "crypto/rand"

	"sync"

	"bytes"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestScenario_JoinGroup(t *testing.T) {
	cases := []struct {
		Name           string
		NumberOfClient int
		ConnectFunc    ConnnectTestingProtocolFunc
		IsSlowTest     bool
	}{
		{"2 clients/connectAll", 2, ConnectAll, true},

		// @FIXME(gfanton): those tests doesn't works
		// {"3 clients/connectAll", 3, ConnectAll, false},
		// {"10 clients/connectAll", 10, ConnectAll, true},
		// {"10 clients/connectInLine", 10, ConnectInLine, true},
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.IsSlowTest {
				testutil.SkipSlow(t)
			}

			testingScenario_JoinGroup(t, tc.NumberOfClient, tc.ConnectFunc)
		})
	}
}

func testingScenario_JoinGroup(t *testing.T, nService int, cf ConnnectTestingProtocolFunc) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	opts := TestingOpts{
		Logger: testutil.Logger(t),
	}

	// Setup test

	pts, cleanup := generateTestingProtocol(ctx, t, &opts, nService)
	defer cleanup()

	// connect all pts together
	cf(t, pts)

	// create group
	group, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// Run test

	// Get Instance Configuration
	{
		// check if everything is ready
		for _, pt := range pts {
			_, err := pt.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
		}
	}

	// Join Group
	{
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
	}

	// Get Group Info
	{
		for _, pt := range pts {
			res, err := pt.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
				GroupPK: group.PublicKey,
			})
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)
		}
	}

	// Activate Group
	{
		for _, pt := range pts {
			_, err := pt.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			})
			assert.NoError(t, err)
		}
	}

	// Subscribe to GroupMessage
	clsGroupMessage := make([]ProtocolService_GroupMessageSubscribeClient, nService)
	{
		// @FIXME: remove this log if `time.AfterFunc` in `GroupMessageSubscribe` is removed
		t.Log("Subscribe to GroupMessage")

		start := time.Now()

		for i, pt := range pts {
			var err error

			clsGroupMessage[i], err = pt.Client.GroupMessageSubscribe(ctx, &bertytypes.GroupMessageSubscribe_Request{
				GroupPK: group.PublicKey,
			})
			require.NoError(t, err)

			// wait for subscribe to be ready
			header, err := clsGroupMessage[i].Header()
			require.NoError(t, err)

			rs := header.Get("ready")
			assert.Contains(t, rs, strconv.FormatBool(true))
		}
		t.Logf("  duration: %s", time.Since(start))
	}

	// client stream are needed to continue this test
	require.NotContains(t, clsGroupMessage, nil)

	// Send Message on the group
	var testMessage = []byte("hello world")
	{
		for i, pt := range pts {
			payload := []byte(fmt.Sprintf("%s:%d", testMessage, i))
			_, err := pt.Client.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
				GroupPK: group.PublicKey,
				Payload: payload,
			})

			assert.NoError(t, err)
		}
	}

	// Receive message on subscribed group
	{
		testrx := fmt.Sprintf("^%s", testMessage)
		for _, cl := range clsGroupMessage {

			nmsg := 0
			for nmsg < nService {
				res, err := cl.Recv()
				if !assert.NoError(t, err) {
					break
				}

				assert.Regexp(t, testrx, string(res.GetMessage()))
				nmsg++
			}

			assert.Equal(t, nService, nmsg)
		}
	}

	// List all messages
	{
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

			assert.Equal(t, nService, nmsg)
			assert.Equal(t, io.EOF, err)
		}
	}
}

func TestScenario_ContactMessage(t *testing.T) {
	const nService = 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	opts := TestingOpts{
		Logger: testutil.Logger(t),
	}

	// Setup test
	pts, cleanup := generateTestingProtocol(ctx, t, &opts, nService)
	defer cleanup()

	pt := pts[0]

	_, otherPK, err := crypto.GenerateEd25519Key(crand.Reader)
	require.NoError(t, err)

	otherPKBytes, err := otherPK.Raw()
	require.NoError(t, err)

	otherSharableContact := &bertytypes.ShareableContact{
		PK:                   otherPKBytes,
		PublicRendezvousSeed: bytes.Repeat([]byte("."), bertytypes.RendezvousSeedLength),
		Metadata:             []byte("useless"),
	}

	_, err = pt.Client.ContactRequestSend(ctx, &bertytypes.ContactRequestSend_Request{
		Contact: otherSharableContact,
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
		if !assert.NoError(t, err) {
			return
		}

		defer subCancel()

		for {
			if subCtx.Err() != nil {
				return
			}

			res, err := sub.Recv()
			if err == io.EOF {
				return
			}
			if !assert.NoError(t, err) {
				continue
			}

			expectedMessagesLock.Lock()
			value, ok := expectedMessages[string(res.Message)]
			if !assert.True(t, ok, "unexpected message `%s`", res.Message) {
				expectedMessagesLock.Unlock()
				return
			}
			expectedMessagesLock.Unlock()

			if value {
				continue
			}

			expectedMessagesLock.Lock()
			expectedMessages[string(res.Message)] = true
			expectedMessagesCount--
			expectedMessagesLock.Unlock()

			if expectedMessagesCount == 0 {
				return
			}
		}
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
