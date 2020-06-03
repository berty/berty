package bertyprotocol

import (
	"context"
	"fmt"
	"io"
	"sync/atomic"
	"testing"
	"time"

	crand "crypto/rand"

	"sync"

	"bytes"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/libp2p/go-libp2p-core/crypto"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func TestScenario_JoinGroup(t *testing.T) {
	cases := []struct {
		Name           string
		NumberOfClient int
		ConnectFunc    ConnnectTestingProtocolFunc
		IsSlowTest     bool
	}{

		{"2 clients/connectAll", 2, ConnectAll, true},
		// {"3 clients/connectAll", 3, ConnectAll, false},
		//{"5 clients/connectAll", 5, ConnectAll, true},
		//{"8 clients/connectAll", 8, ConnectAll, false},
		//@FIXME(gfanton): those tests doesn't works
		//{"10 clients/connectAll", 10, ConnectAll, true},
		// {"10 clients/connectInLine", 10, ConnectInLine, true},
	}

	tr := tracer.NewTestingProvider(t, "Scenario_JoinGroup").Tracer("testing")
	ctx := context.Background()
	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.IsSlowTest {
				testutil.SkipSlow(t)
			}

			opts := TestingOpts{
				Mocknet: libp2p_mocknet.New(ctx),
				Logger:  testutil.Logger(t),
			}

			pts, cleanup := generateTestingProtocol(ctx, t, &opts, tc.NumberOfClient)
			defer cleanup()

			// connect all pts together
			tc.ConnectFunc(t, opts.Mocknet)

			ctx, span := tr.Start(ctx, tc.Name)
			defer span.End()

			testingScenario_JoinGroup(ctx, t, pts...)
		})
	}
}

func isEventAddSecretTargetedToMember(ownRawPK []byte, evt *bertytypes.GroupMetadataEvent) ([]byte, error) {
	// Only count EventTypeGroupDeviceSecretAdded events
	if evt.Metadata.EventType != bertytypes.EventTypeGroupDeviceSecretAdded {
		return nil, nil
	}

	sec := &bertytypes.GroupAddDeviceSecret{}
	err := sec.Unmarshal(evt.Event)
	if err != nil {
		return nil, err
	}

	// Filter out events targeted at other members
	if !bytes.Equal(ownRawPK, sec.DestMemberPK) {
		return nil, nil
	}

	return sec.DevicePK, nil
}

func testingScenario_JoinGroup(ctx context.Context, t *testing.T, pts ...*TestingProtocol) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	nService := len(pts)

	// Setup test
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
		}
	}

	// Get Group Info
	memberPKs := make([][]byte, nService)
	devicePKs := make([][]byte, nService)
	{
		for i, pt := range pts {
			res, err := pt.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
				GroupPK: group.PublicKey,
			})
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)

			memberPKs[i] = res.MemberPK
			devicePKs[i] = res.DevicePK
		}
	}

	// Activate Group
	{
		for i, pt := range pts {
			_, err := pt.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			})

			assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
		}
	}

	{
		wg := sync.WaitGroup{}
		secretsReceivedLock := sync.Mutex{}
		secretsReceived := make([]map[string]struct{}, nService)
		wg.Add(nService)

		// @FIXME: remove this log if `time.AfterFunc` in `GroupMessageSubscribe` is removed
		t.Log("Subscribe to GroupMetadata")

		start := time.Now()
		nSuccess := int64(0)
		for i := range pts {
			go func(i int) {
				pt := pts[i]

				defer wg.Done()

				secretsReceived[i] = map[string]struct{}{}

				ctx, cancel := context.WithCancel(ctx)
				defer cancel()

				sub, inErr := pt.Client.GroupMetadataSubscribe(ctx, &bertytypes.GroupMetadataSubscribe_Request{
					GroupPK: group.PublicKey,
					Since:   []byte("give me everything"),
				})
				if inErr != nil {
					assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
					return
				}

				for {
					evt, inErr := sub.Recv()
					if inErr != nil {
						if inErr != io.EOF {
							assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
						}

						break
					}

					if source, err := isEventAddSecretTargetedToMember(memberPKs[i], evt); err != nil {
						pts[i].Opts.Logger.Error("err:", zap.Error(inErr))
						assert.NoError(t, err, fmt.Sprintf("error for client %d", i))

						break
					} else if source != nil {
						secretsReceivedLock.Lock()
						secretsReceived[i][string(source)] = struct{}{}
						done := len(secretsReceived[i]) == nService
						secretsReceivedLock.Unlock()

						if done {
							atomic.AddInt64(&nSuccess, 1)
							nSuccess := atomic.LoadInt64(&nSuccess)

							got := fmt.Sprintf("%d/%d", nSuccess, nService)
							pts[i].Opts.Logger.Debug("received all secrets", zap.String("ok", got))
							return
						}
					}
				}
			}(i)
		}

		wg.Wait()
		t.Logf("  duration: %s", time.Since(start))

		secretsReceivedLock.Lock()
		ok := true
		for i := range secretsReceived {
			if !assert.Equal(t, nService, len(secretsReceived[i]), fmt.Sprintf("mismatch for client %d", i)) {
				ok = false
			}
		}
		require.True(t, ok)
		secretsReceivedLock.Unlock()
		//return
	}

	wg := sync.WaitGroup{}
	wg.Add(3)

	// Subscribe to GroupMessage
	clsGroupMessage := make([]ProtocolService_GroupMessageSubscribeClient, nService)
	{
		//ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		//defer cancel()

		// @FIXME: remove this log if `time.AfterFunc` in `GroupMessageSubscribe` is removed
		t.Log("Subscribe to GroupMessage")

		start := time.Now()

		for i, pt := range pts {
			var err error

			clsGroupMessage[i], err = pt.Client.GroupMessageSubscribe(ctx, &bertytypes.GroupMessageSubscribe_Request{
				GroupPK: group.PublicKey,
				Since:   []byte("give me everything"),
			})
			require.NoError(t, err)
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

			assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
		}
	}

	// Receive message on subscribed group
	{
		testrx := fmt.Sprintf("^%s", testMessage)
		for i, cl := range clsGroupMessage {

			msgs := map[string]struct{}{}
			for len(msgs) < nService {
				res, err := cl.Recv()
				if !assert.NoError(t, err) {
					break
				}

				assert.Regexp(t, testrx, string(res.GetMessage()), fmt.Sprintf("invalid message for client %d", i))
				testutil.Logger(t).Info(fmt.Sprintf("[%d] - sub received - %s", i, string(res.GetMessage())))
				msgs[string(res.GetMessage())] = struct{}{}
			}

			assert.Equal(t, nService, len(msgs), fmt.Sprintf("error for client %d", i))
		}
	}

	// List all messages
	{
		testrx := fmt.Sprintf("^%s", testMessage)

		for i, pt := range pts {
			req := bertytypes.GroupMessageList_Request{
				GroupPK: group.PublicKey,
			}

			cl, err := pt.Client.GroupMessageList(ctx, &req)
			if !assert.NoError(t, err, fmt.Sprintf("error for client %d", i)) {
				continue
			}

			nmsg := 0
			var res *bertytypes.GroupMessageEvent
			for {
				res, err = cl.Recv()
				if err == io.EOF {
					break
				}
				if !assert.NoError(t, err, fmt.Sprintf("error for client %d", i)) {
					continue
				}

				assert.Regexp(t, testrx, string(res.GetMessage()), fmt.Sprintf("invalid message for client %d", i))

				testutil.Logger(t).Info(fmt.Sprintf("[%d] - list received - %s", i, string(res.GetMessage())))
				nmsg++
			}

			assert.Equal(t, nService, nmsg, fmt.Sprintf("mismatch for client %d", i))
			assert.Equal(t, io.EOF, err, fmt.Sprintf("error for client %d", i))
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
