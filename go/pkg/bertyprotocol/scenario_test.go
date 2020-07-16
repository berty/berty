package bertyprotocol

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

type testCase struct {
	Name           string
	NumberOfClient int
	ConnectFunc    ConnnectTestingProtocolFunc
	IsSlowTest     bool
	IsUnstableTest bool
	Timeout        time.Duration
}

type testFunc func(context.Context, *testing.T, ...*TestingProtocol)

// Tests

func TestScenario_CreateMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		{"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		{"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		{"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		{"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		{"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		createMultiMemberGroup(ctx, t, tps...)
	})
}

func TestScenario_MessageMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		{"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		{"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		{"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		{"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		{"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
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
		{"2 clients/connectAll", 2, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		{"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		{"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		{"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		{"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		{"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		{"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		{"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
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
		// FIXME: all test cases below (see TODO below)
		{"2 clients/connectAll", 2, ConnectAll, false, false, time.Second * 10},
		// {"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		// {"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		// {"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		// {"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		// {"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		// {"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		// {"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		// {"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
		// TODO: Uncomment when fixed
		// Add accounts as contacts
		// addAsContact(ctx, t, tps, tps)
		///////////////////////

		// TODO: Remove when fixed
		addAsContact(ctx, t, tps[0:1], tps)
		///////////////////////
	})
}

func TestScenario_MessageContactGroup(t *testing.T) {
	cases := []testCase{
		// FIXME: all test cases below
		// {"2 clients/connectAll", 2, ConnectAll, false, false, time.Second * 10},
		// {"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		// {"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		// {"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		// {"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		// {"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		// {"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		// {"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		// {"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
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
		{"1 client/connectAll", 1, ConnectAll, false, false, time.Second * 10},
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
		// FIXME: all test cases below
		// {"2 clients/connectAll", 2, ConnectAll, false, false, time.Second * 10},
		// {"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		// {"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		// {"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		// {"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		// {"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		// {"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		// {"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		// {"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
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
			sendMessageOnGroup(ctx, t, tps, tps, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on MultiMember Group =====")
		// Each member sends 3 messages on MultiMember Group
		messages = []string{"test4", "test5", "test6"}
		sendMessageOnGroup(ctx, t, tps, tps, mmGroup, messages)
	})
}

func TestScenario_MessageAccountAndContactGroups(t *testing.T) {
	cases := []testCase{
		// FIXME: all test cases below
		// {"2 clients/connectAll", 2, ConnectAll, false, false, time.Second * 10},
		// {"3 clients/connectAll", 3, ConnectAll, false, true, time.Second * 10},
		// {"3 clients/connectInLine", 3, ConnectInLine, false, true, time.Second * 10},
		// {"5 clients/connectAll", 5, ConnectAll, true, true, time.Second * 10},
		// {"5 clients/connectInLine", 5, ConnectInLine, true, true, time.Second * 10},
		// {"8 clients/connectAll", 8, ConnectAll, true, true, time.Second * 10},
		// {"8 clients/connectInLine", 8, ConnectInLine, true, true, time.Second * 10},
		// {"10 clients/connectAll", 10, ConnectAll, true, true, time.Second * 10},
		// {"10 clients/connectInLine", 10, ConnectInLine, true, true, time.Second * 10},
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
			sendMessageOnGroup(ctx, t, tps, tps, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on Contact Group =====")
		// Send messages between all accounts on contact groups
		messages = []string{"contact4", "contact5", "contact6"}
		sendMessageToContact(ctx, t, messages, tps)
	})
}

// Helpers

func testingScenario(t *testing.T, tcs []testCase, tf testFunc) {
	ctx := context.Background()

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

	for _, tc := range tcs {
		t.Run(tc.Name, func(t *testing.T) {
			if tc.IsSlowTest {
				testutil.SkipSlow(t)
			}
			if tc.IsUnstableTest {
				testutil.SkipUnstable(t)
			}

			opts := TestingOpts{
				Mocknet: libp2p_mocknet.New(ctx),
				Logger:  testutil.Logger(t),
			}

			tps, cleanup := newTestingProtocolWithMockedPeers(ctx, t, &opts, tc.NumberOfClient)
			defer cleanup()

			// connect all tps together
			tc.ConnectFunc(t, opts.Mocknet)

			var cctx context.Context
			var cancel context.CancelFunc

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
	t.Log(logTree("Create and Join MultiMember Group", 0, true))
	start := time.Now()

	ntps := len(tps)

	// Create group
	group, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	// Get Instance Configurations
	{
		t.Log(logTree("Get Instance Configuration", 1, true))
		start := time.Now()

		// check if everything is ready
		for _, pt := range tps {
			_, err := pt.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
		}

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Join Group
	{
		t.Log(logTree("Join Group", 1, true))
		start := time.Now()

		for _, pt := range tps {
			req := bertytypes.MultiMemberGroupJoin_Request{
				Group: group,
			}

			// pt join group
			_, err = pt.Client.MultiMemberGroupJoin(ctx, &req)
			require.NoError(t, err)
		}

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Get Member/Device PKs
	memberPKs := make([][]byte, ntps)
	devicePKs := make([][]byte, ntps)
	{
		t.Log(logTree("Get Member/Device PKs", 1, true))
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

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Activate Group
	{
		t.Log(logTree("Activate Group", 1, true))
		start := time.Now()

		for i, pt := range tps {
			_, err := pt.Client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			})

			assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
		}

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Exchange Secrets
	{
		t.Log(logTree("Exchange Secrets", 1, true))
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

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	t.Logf(logTree("duration: %s", 0, false), time.Since(start))

	return group.PublicKey
}

func addAsContact(ctx context.Context, t *testing.T, senders, receivers []*TestingProtocol) {
	t.Log(logTree("Add Senders/Receivers as Contact", 0, true))
	start := time.Now()
	var sendDuration, receiveDuration, acceptDuration, activateDuration time.Duration

	for _, sender := range senders {
		for _, receiver := range receivers {
			substart := time.Now()

			// Get sender/receiver configs
			senderCfg, err := sender.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, senderCfg)
			receiverCfg, err := receiver.Client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, receiverCfg)

			// Skip if sender and receiver are the same account
			if bytes.Compare(senderCfg.AccountPK, receiverCfg.AccountPK) == 0 {
				continue
			}

			// Setup receiver's sharable contact
			_, err = receiver.Client.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})
			require.NoError(t, err)
			receiverRDV, err := receiver.Client.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
			require.NoError(t, err)
			require.NotNil(t, receiverRDV)

			receiverSharableContact := &bertytypes.ShareableContact{
				PK:                   receiverCfg.AccountPK,
				PublicRendezvousSeed: receiverRDV.PublicRendezvousSeed,
			}

			// Sender sends contact request
			_, err = sender.Client.ContactRequestSend(ctx, &bertytypes.ContactRequestSend_Request{
				Contact: receiverSharableContact,
			})
			require.NoError(t, err)

			sendDuration += time.Since(substart)
			substart = time.Now()

			// Receiver subcribes to handle incoming contact request
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

	t.Log(logTree("Send Contact Requests", 1, true))
	t.Logf(logTree("duration: %s", 1, false), sendDuration)
	t.Log(logTree("Receive Contact Requests", 1, true))
	t.Logf(logTree("duration: %s", 1, false), receiveDuration)
	t.Log(logTree("Accept Contact Requests", 1, true))
	t.Logf(logTree("duration: %s", 1, false), acceptDuration)
	t.Log(logTree("Activate Contact Groups", 1, true))
	t.Logf(logTree("duration: %s", 1, false), activateDuration)

	t.Logf(logTree("duration: %s", 0, false), time.Since(start))
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
	t.Log(logTree("Send, Receive and List Messages", 0, true))
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
		t.Log(logTree("Senders Send Messages", 1, true))
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

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Receivers receive all expected messages
	{
		t.Log(logTree("Receivers Receive Messages (subscription)", 1, true))
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

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}

	// Receivers list all expected messages
	{
		t.Log(logTree("Receivers List Messages (store)", 1, true))
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

				ml, err := receiver.Client.GroupMessageList(ctx, &req)
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

		t.Logf(logTree("duration: %s", 1, false), time.Since(start))
	}
	t.Logf(logTree("duration: %s", 0, false), time.Since(start))
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

func logTree(log string, indent int, title bool) string {
	if !title {
		log = "└── " + log
	}

	for i := 0; i < indent; i++ {
		log = "│  " + log
	}

	return log
}
