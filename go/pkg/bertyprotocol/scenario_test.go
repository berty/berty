package bertyprotocol

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/goleak"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type testCase struct {
	Name           string
	NumberOfClient int
	ConnectFunc    ConnnectTestingProtocolFunc
	Speed          testutil.Speed
	Stability      testutil.Stability
	Timeout        time.Duration
}

type testFunc func(context.Context, *testing.T, ...*TestingProtocol)

// Tests

func TestScenario_CreateMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 40},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		createMultiMemberGroup(ctx, t, tps...)
	})
}

func TestScenario_MessageMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 40},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		// Create MultiMember Group
		groupID := createMultiMemberGroup(ctx, t, tps...)

		// Each member sends 3 messages on MultiMember Group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, groupID, messages)
	})
}

func TestScenario_MessageSeveralMultiMemberGroups(t *testing.T) {
	const ngroup = 3

	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Unstable, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 20},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 40},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		for i := 0; i < ngroup; i++ {
			t.Logf("===== MultiMember Group #%d =====", i+1)
			// Create MultiMember Group
			groupID := createMultiMemberGroup(ctx, t, tps...)

			// Each member sends 3 messages on MultiMember Group
			messages := []string{"test1", "test2", "test3"}
			sendMessageOnGroup(ctx, t, tps, tps, groupID, messages)
		}
	})
}

func TestScenario_AddContact(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 20},       // marked as "unstable" because it failed multiple times on the CI recently
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 20},       // marked as "unstable" because it failed multiple times on the CI recently
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Unstable, time.Second * 20}, // marked as "unstable" because it failed multiple times on the CI recently
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 30},       // marked as "unstable" because it failed multiple times on the CI recently
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 30}, // marked as "unstable" because it failed multiple times on the CI recently
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 40},       // marked as "unstable" because it failed multiple times on the CI recently
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 40}, // marked as "unstable" because it failed multiple times on the CI recently
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 60},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 60},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		addAsContact(ctx, t, tps, tps)
	})
}

func TestScenario_MessageContactGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 20},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Unstable, time.Second * 20},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Unstable, time.Second * 20},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Unstable, time.Second * 30},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 40},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 60},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 60},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		// Add accounts as contacts
		addAsContact(ctx, t, tps, tps)

		// Send messages between all accounts on contact groups
		messages := []string{"test1", "test2", "test3"}
		sendMessageToContact(ctx, t, messages, tps)
	})

}

func TestScenario_MessageAccountGroup(t *testing.T) {
	cases := []testCase{
		{"1 client/connectAll", 1, ConnectAll, testutil.Fast, testutil.Stable, time.Second * 10},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		// Get account config
		config, err := tps[0].Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
		require.NoError(t, err)
		require.NotNil(t, config)

		// Send messages on account group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, config.AccountGroupPK, messages)
	})
}

func TestScenario_MessageAccountAndMultiMemberGroups(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Broken, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 20},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 20},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 30},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 30},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		t.Log("===== Send Messages on MultiMember Group =====")
		// Create MultiMember Group
		mmGroup := createMultiMemberGroup(ctx, t, tps...)

		// Each member sends 3 messages on MultiMember Group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, mmGroup, messages)

		t.Log("===== Send Messages on Account Group =====")
		// Send messages on account groups
		for _, account := range tps {
			// Get account config
			config, err := account.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, config)

			// Send messages on account group
			messages = []string{"account1", "account2", "account3"}
			sendMessageOnGroup(ctx, t, []*TestingProtocol{account}, []*TestingProtocol{account}, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on MultiMember Group =====")
		// Each member sends 3 messages on MultiMember Group
		messages = []string{"test4", "test5", "test6"}
		sendMessageOnGroup(ctx, t, tps, tps, mmGroup, messages)
	})
}

func TestScenario_MessageAccountAndContactGroups(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, testutil.Fast, testutil.Broken, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 20},
		{"5 clients/connectInLine", 5, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 20},
		{"8 clients/connectAll", 8, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 30},
		{"8 clients/connectInLine", 8, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 30},
		{"10 clients/connectAll", 10, ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
		{"10 clients/connectInLine", 10, ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		t.Log("===== Send Messages on Contact Group =====")
		// Add accounts as contacts
		addAsContact(ctx, t, tps, tps)

		// Send messages between all accounts on contact groups
		messages := []string{"contact1", "contact2", "contact3"}
		sendMessageToContact(ctx, t, messages, tps)

		t.Log("===== Send Messages on Account Group =====")
		// Send messages on account groups
		for _, account := range tps {
			// Get account config
			config, err := account.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, config)

			// Send messages on account group
			messages = []string{"account1", "account2", "account3"}
			sendMessageOnGroup(ctx, t, []*TestingProtocol{account}, []*TestingProtocol{account}, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on Contact Group =====")
		// Send messages between all accounts on contact groups
		messages = []string{"contact4", "contact5", "contact6"}
		sendMessageToContact(ctx, t, messages, tps)
	})
}

// Helpers

func testingScenario(t *testing.T, tcs []testCase, tf testFunc) {
	var tracerName string
	pc, _, _, ok := runtime.Caller(1)
	fun := runtime.FuncForPC(pc)
	if ok && fun != nil {
		funcName := strings.Split(fun.Name(), ".")
		tracerName = funcName[len(funcName)-1]
	} else {
		tracerName = "TestingScenario"
	}
	tr := tracer.NewTestingProvider(t, tracerName).Tracer("testing")

	if os.Getenv("WITH_GOLEAK") == "1" {
		defer goleak.VerifyNone(t,
			goleak.IgnoreTopFunction("github.com/syndtr/goleveldb/leveldb.(*DB).mpoolDrain"),           // inherited from one of the imports (init)
			goleak.IgnoreTopFunction("github.com/ipfs/go-log/writer.(*MirrorWriter).logRoutine"),       // inherited from one of the imports (init)
			goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*BasicConnMgr).background"), // inherited from github.com/ipfs/go-ipfs/core.NewNode
			goleak.IgnoreTopFunction("github.com/jbenet/goprocess/periodic.callOnTicker.func1"),        // inherited from github.com/ipfs/go-ipfs/core.NewNode
			goleak.IgnoreTopFunction("github.com/libp2p/go-libp2p-connmgr.(*decayer).process"),         // inherited from github.com/ipfs/go-ipfs/core.NewNode)
			goleak.IgnoreTopFunction("go.opencensus.io/stats/view.(*worker).start"),                    // inherited from github.com/ipfs/go-ipfs/core.NewNode)
			goleak.IgnoreTopFunction("github.com/desertbit/timer.timerRoutine"),                        // inherited from github.com/ipfs/go-ipfs/core.NewNode)
			goleak.IgnoreTopFunction("go.opentelemetry.io/otel/instrumentation/grpctrace.wrapClientStream.func1"),
			goleak.IgnoreTopFunction("go.opentelemetry.io/otel/instrumentation/grpctrace.StreamClientInterceptor.func1.1"),
		)
	}

	for _, tc := range tcs {
		t.Run(tc.Name, func(t *testing.T) {
			testutil.FilterStabilityAndSpeed(t, tc.Stability, tc.Speed)

			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			logger, cleanup := testutil.Logger(t)
			defer cleanup()

			opts := TestingOpts{
				Mocknet: libp2p_mocknet.New(ctx),
				Logger:  logger,
			}

			tps, cleanup := NewTestingProtocolWithMockedPeers(ctx, t, &opts, tc.NumberOfClient)
			defer cleanup()

			// connect all tps together
			tc.ConnectFunc(t, opts.Mocknet)

			var cctx context.Context

			if tc.Timeout > 0 {
				cctx, cancel = context.WithTimeout(ctx, tc.Timeout)
			} else {
				cctx, cancel = context.WithCancel(ctx)
			}
			spanctx, span := tr.Start(cctx, tc.Name)

			tf(spanctx, t, tps...)

			span.End()
			cancel()
		})
	}
}

func createMultiMemberGroup(ctx context.Context, t *testing.T, tps ...*TestingProtocol) (groupID []byte) {
	logTree(t, "Create and Join MultiMember Group", 0, true)
	start := time.Now()

	ntps := len(tps)

	// Create group
	group, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// Get Instance Configurations
	{
		logTree(t, "Get Instance Configuration", 1, true)
		start := time.Now()

		// check if everything is ready
		for _, pt := range tps {
			_, err := pt.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Join Group
	{
		logTree(t, "Join Group", 1, true)
		start := time.Now()

		for _, pt := range tps {
			req := bertytypes.MultiMemberGroupJoin_Request{
				Group: group,
			}

			// pt join group
			_, err = pt.Client.MultiMemberGroupJoin(ctx, &req)
			require.NoError(t, err)
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Get Member/Device PKs
	memberPKs := make([][]byte, ntps)
	devicePKs := make([][]byte, ntps)
	{
		logTree(t, "Get Member/Device PKs", 1, true)
		start := time.Now()

		for i, pt := range tps {
			res, err := pt.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
				GroupPK: group.PublicKey,
			})
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)

			memberPKs[i] = res.MemberPK
			devicePKs[i] = res.DevicePK
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Activate Group
	{
		logTree(t, "Activate Group", 1, true)
		start := time.Now()

		for i, pt := range tps {
			_, err := pt.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			})

			assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Exchange Secrets
	{
		logTree(t, "Exchange Secrets", 1, true)
		start := time.Now()

		wg := sync.WaitGroup{}
		secretsReceivedLock := sync.Mutex{}
		secretsReceived := make([]map[string]struct{}, ntps)
		wg.Add(ntps)

		nSuccess := int64(0)
		for i := range tps {
			go func(i int) {
				tp := tps[i]

				defer wg.Done()

				secretsReceived[i] = map[string]struct{}{}

				ctx, cancel := context.WithCancel(ctx)
				defer cancel()

				sub, inErr := tp.Client.GroupMetadataSubscribe(ctx, &bertytypes.GroupMetadataSubscribe_Request{
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
						tps[i].Opts.Logger.Error("err:", zap.Error(inErr))
						assert.NoError(t, err, fmt.Sprintf("error for client %d", i))

						break
					} else if source != nil {
						secretsReceivedLock.Lock()
						secretsReceived[i][string(source)] = struct{}{}
						done := len(secretsReceived[i]) == ntps
						secretsReceivedLock.Unlock()

						if done {
							atomic.AddInt64(&nSuccess, 1)
							nSuccess := atomic.LoadInt64(&nSuccess)

							got := fmt.Sprintf("%d/%d", nSuccess, ntps)
							tps[i].Opts.Logger.Debug("received all secrets", zap.String("ok", got))
							return
						}
					}
				}
			}(i)
		}

		wg.Wait()

		secretsReceivedLock.Lock()
		ok := true
		for i := range secretsReceived {
			if !assert.Equal(t, ntps, len(secretsReceived[i]), fmt.Sprintf("mismatch for client %d", i)) {
				ok = false
			}
		}
		require.True(t, ok)
		secretsReceivedLock.Unlock()

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	logTree(t, "duration: %s", 0, false, time.Since(start))

	return group.PublicKey
}

func addAsContact(ctx context.Context, t *testing.T, senders, receivers []*TestingProtocol) {
	logTree(t, "Add Senders/Receivers as Contact", 0, true)
	start := time.Now()
	var sendDuration, receiveDuration, acceptDuration, activateDuration time.Duration

	for i, sender := range senders {
		for _, receiver := range receivers {
			substart := time.Now()

			// Get sender/receiver configs
			senderCfg, err := sender.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, senderCfg)
			receiverCfg, err := receiver.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, receiverCfg)

			// Setup receiver's sharable contact
			var receiverRDVSeed []byte

			crf, err := receiver.Client.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
			if err != nil || !crf.Enabled || len(crf.PublicRendezvousSeed) == 0 {
				_, err = receiver.Client.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})
				require.NoError(t, err)
				receiverRDV, err := receiver.Client.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
				require.NoError(t, err)
				require.NotNil(t, receiverRDV)
				receiverRDVSeed = receiverRDV.PublicRendezvousSeed
			} else {
				receiverRDVSeed = crf.PublicRendezvousSeed
			}

			receiverSharableContact := &bertytypes.ShareableContact{
				PK:                   receiverCfg.AccountPK,
				PublicRendezvousSeed: receiverRDVSeed,
			}

			// Sender sends contact request
			_, err = sender.Client.ContactRequestSend(ctx, &bertytypes.ContactRequestSend_Request{
				Contact: receiverSharableContact,
			})

			// Check if sender and receiver are the same account, should return the right error and skip
			if bytes.Compare(senderCfg.AccountPK, receiverCfg.AccountPK) == 0 {
				require.Equal(t, errcode.LastCode(err), errcode.ErrContactRequestSameAccount)
				continue
			}

			// Check if contact request was already sent, should return right error and skip
			receiverWasSender := false
			for j := 0; j < i; j++ {
				if senders[j] == receiver {
					receiverWasSender = true
				}
			}

			senderWasReceiver := false
			if receiverWasSender {
				for _, r := range receivers {
					if r == sender {
						senderWasReceiver = true
					}
				}
			}

			if receiverWasSender && senderWasReceiver {
				require.Equal(t, errcode.LastCode(err), errcode.ErrContactRequestContactAlreadyAdded)
				continue
			}

			// No other error should occur
			require.NoError(t, err)

			sendDuration += time.Since(substart)
			substart = time.Now()

			// Receiver subscribes to handle incoming contact request
			subCtx, subCancel := context.WithCancel(ctx)
			subReceiver, err := receiver.Client.GroupMetadataSubscribe(subCtx, &bertytypes.GroupMetadataSubscribe_Request{
				GroupPK: receiverCfg.AccountGroupPK,
				Since:   []byte("give me everything"),
			})
			require.NoError(t, err)
			found := false

			// Receiver waits for valid contact request coming from sender
			for {
				evt, err := subReceiver.Recv()
				if err == io.EOF || subReceiver.Context().Err() != nil {
					break
				}

				require.NoError(t, err)

				if evt == nil || evt.Metadata.EventType != bertytypes.EventTypeAccountContactRequestIncomingReceived {
					continue
				}

				req := &bertytypes.AccountContactRequestReceived{}
				err = req.Unmarshal(evt.Event)

				require.NoError(t, err)

				if bytes.Compare(senderCfg.AccountPK, req.ContactPK) == 0 {
					found = true
					break
				}
			}

			subCancel()
			require.True(t, found)

			receiveDuration += time.Since(substart)
			substart = time.Now()

			// Receiver accepts contact request
			_, err = receiver.Client.ContactRequestAccept(ctx, &bertytypes.ContactRequestAccept_Request{
				ContactPK: senderCfg.AccountPK,
			})

			require.NoError(t, err)

			acceptDuration += time.Since(substart)
			substart = time.Now()

			// Both receiver and sender activate the contact group
			grpInfo, err := sender.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
				ContactPK: receiverCfg.AccountPK,
			})
			require.NoError(t, err)

			_, err = sender.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: grpInfo.Group.PublicKey,
			})

			require.NoError(t, err)

			_, err = receiver.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: grpInfo.Group.PublicKey,
			})

			require.NoError(t, err)

			activateDuration += time.Since(substart)
			substart = time.Now()
		}
	}

	logTree(t, "Send Contact Requests", 1, true)
	logTree(t, "duration: %s", 1, false, sendDuration)
	logTree(t, "Receive Contact Requests", 1, true)
	logTree(t, "duration: %s", 1, false, receiveDuration)
	logTree(t, "Accept Contact Requests", 1, true)
	logTree(t, "duration: %s", 1, false, acceptDuration)
	logTree(t, "Activate Contact Groups", 1, true)
	logTree(t, "duration: %s", 1, false, activateDuration)

	logTree(t, "duration: %s", 0, false, time.Since(start))
}

func sendMessageToContact(ctx context.Context, t *testing.T, messages []string, tps []*TestingProtocol) {
	for _, sender := range tps {
		for _, receiver := range tps {
			// Don't try to send messages to itself using contact group
			if sender == receiver {
				continue
			}

			// Get contact group
			contactGroup, err := sender.Client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
				ContactPK: getAccountPubKey(t, receiver),
			})
			require.NoError(t, err)
			require.NotNil(t, contactGroup)

			// Send messages on contact group
			sendMessageOnGroup(ctx, t, []*TestingProtocol{sender}, []*TestingProtocol{receiver}, contactGroup.Group.PublicKey, messages)
		}
	}
}

func sendMessageOnGroup(ctx context.Context, t *testing.T, senders, receivers []*TestingProtocol, groupPK []byte, messages []string) {
	logTree(t, "Send, Receive and List Messages", 0, true)
	start := time.Now()

	// Setup expectedMessages map
	expectedMessages := map[string]struct{}{}
	expectedMessagesCount := len(messages) * len(senders)
	expectedMessagesLock := sync.Mutex{}

	for _, message := range messages {
		for _, sender := range senders {
			expectedMessage := getAccountB64PubKey(t, sender) + " - " + message
			expectedMessages[expectedMessage] = struct{}{}
		}
	}

	// Setup map to check expected messages reception
	subReceivedMessages := map[string]map[string]bool{}
	subReceivedMessagesCount := map[string]int{}
	listReceivedMessages := map[string]map[string]bool{}
	listReceivedMessagesCount := map[string]int{}

	for _, receiver := range receivers {
		subReceiverMap := map[string]bool{}
		listReceiverMap := map[string]bool{}

		for expectedMessage := range expectedMessages {
			subReceiverMap[expectedMessage] = false
			listReceiverMap[expectedMessage] = false
		}

		receiverID := getAccountB64PubKey(t, receiver)
		subReceivedMessages[receiverID] = subReceiverMap
		listReceivedMessages[receiverID] = listReceiverMap
		subReceivedMessagesCount[receiverID] = 0
		listReceivedMessagesCount[receiverID] = 0
	}
	receivedMessagesLock := sync.Mutex{}

	// Senders send all expected messages
	{
		logTree(t, "Senders Send Messages", 1, true)
		start := time.Now()

		for _, sender := range senders {
			senderID := getAccountB64PubKey(t, sender)
			for _, message := range messages {
				_, err := sender.Client.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
					GroupPK: groupPK,
					Payload: []byte(senderID + " - " + message),
				})

				require.NoError(t, err)
			}
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Receivers receive all expected messages
	{
		logTree(t, "Receivers Receive Messages (subscription)", 1, true)
		start := time.Now()

		var wg sync.WaitGroup
		wg.Add(len(receivers))

		for _, receiver := range receivers {
			// Subscribe receivers to wait for incoming messages
			go func(receiver *TestingProtocol) {
				subCtx, subCancel := context.WithCancel(ctx)
				defer subCancel()
				defer wg.Done()

				sub, err := receiver.Client.GroupMessageSubscribe(subCtx, &bertytypes.GroupMessageSubscribe_Request{
					GroupPK: groupPK,
					Since:   []byte("give me everything"),
				})
				if !assert.NoError(t, err) {
					return
				}

				receiverID := getAccountB64PubKey(t, receiver)

				for {
					if subCtx.Err() != nil {
						return
					}

					// Receive message
					res, err := sub.Recv()
					if err == io.EOF {
						return
					}
					if !assert.NoError(t, err) {
						continue
					}

					// Check if received message was expected
					expectedMessagesLock.Lock()
					_, expected := expectedMessages[string(res.Message)]
					expectedMessagesLock.Unlock()
					if !expected {
						continue
					}

					// Check if message was already received
					receivedMessagesLock.Lock()
					alreadyReceived, _ := subReceivedMessages[receiverID][string(res.Message)]
					if alreadyReceived {
						receivedMessagesLock.Unlock()
						continue
					}

					// Mark message as received
					subReceivedMessages[receiverID][string(res.Message)] = true
					subReceivedMessagesCount[receiverID]++
					// Return if all expected messages were received
					if subReceivedMessagesCount[receiverID] == expectedMessagesCount {
						receivedMessagesLock.Unlock()
						return
					}
					receivedMessagesLock.Unlock()
				}
			}(receiver)
		}

		// Wait that all receivers received messages
		wg.Wait()

		// Check if everything is ok
		for _, receiver := range receivers {
			receiverID := getAccountB64PubKey(t, receiver)
			assert.Equal(t, expectedMessagesCount, subReceivedMessagesCount[receiverID])
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Receivers list all expected messages
	{
		logTree(t, "Receivers List Messages (store)", 1, true)
		start := time.Now()

		var wg sync.WaitGroup
		wg.Add(len(receivers))

		for _, receiver := range receivers {
			// Subscribe receivers to wait for incoming messages
			go func(receiver *TestingProtocol) {
				subCtx, subCancel := context.WithCancel(ctx)
				defer subCancel()
				defer wg.Done()

				req := bertytypes.GroupMessageList_Request{
					GroupPK: groupPK,
				}

				ml, err := receiver.Client.GroupMessageList(subCtx, &req)
				if !assert.NoError(t, err) {
					return
				}

				receiverID := getAccountB64PubKey(t, receiver)

				for {
					if subCtx.Err() != nil {
						return
					}

					// Receive message
					res, err := ml.Recv()
					if err == io.EOF {
						return
					}
					if !assert.NoError(t, err) {
						continue
					}

					// Check if received message was expected
					expectedMessagesLock.Lock()
					_, expected := expectedMessages[string(res.Message)]
					expectedMessagesLock.Unlock()
					if !expected {
						continue
					}

					// Check if message was already received
					receivedMessagesLock.Lock()
					alreadyReceived, _ := listReceivedMessages[receiverID][string(res.Message)]
					if alreadyReceived {
						receivedMessagesLock.Unlock()
						continue
					}

					// Mark message as received
					listReceivedMessages[receiverID][string(res.Message)] = true
					listReceivedMessagesCount[receiverID]++
					// Return if all expected messages were received
					if listReceivedMessagesCount[receiverID] == expectedMessagesCount {
						receivedMessagesLock.Unlock()
						return
					}
					receivedMessagesLock.Unlock()
				}
			}(receiver)
		}

		// Wait that all receivers listed messages
		wg.Wait()

		// Check if everything is ok
		for _, receiver := range receivers {
			receiverID := getAccountB64PubKey(t, receiver)
			assert.Equal(t, expectedMessagesCount, listReceivedMessagesCount[receiverID])
		}

		logTree(t, "duration: %s", 1, false, time.Since(start))
	}
	logTree(t, "duration: %s", 0, false, time.Since(start))
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

func getAccountPubKey(t *testing.T, tp *TestingProtocol) []byte {
	t.Helper()

	tpSK, err := tp.Opts.DeviceKeystore.AccountPrivKey()
	require.NoError(t, err)
	tpPK, err := tpSK.GetPublic().Raw()
	require.NoError(t, err)

	return tpPK
}

func getAccountB64PubKey(t *testing.T, tp *TestingProtocol) string {
	t.Helper()

	tpPK := getAccountPubKey(t, tp)

	return base64.StdEncoding.EncodeToString(tpPK)
}
