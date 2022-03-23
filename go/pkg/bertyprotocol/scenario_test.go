package bertyprotocol_test

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	ds "github.com/ipfs/go-datastore"
	dsync "github.com/ipfs/go-datastore/sync"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/goleak"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertyreplication"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/replicationtypes"
)

type testCase struct {
	Name           string
	NumberOfClient int
	ConnectFunc    bertyprotocol.ConnectTestingProtocolFunc
	Speed          testutil.Speed
	Stability      testutil.Stability
	Timeout        time.Duration
}

type testFunc func(context.Context, *testing.T, ...*bertyprotocol.TestingProtocol)

// Tests

func TestScenario_CreateMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectInLine", 3, bertyprotocol.ConnectInLine, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"5 clients/connectInLine", 5, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"8 clients/connectInLine", 8, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 40},
		{"10 clients/connectInLine", 10, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		createMultiMemberGroup(ctx, t, tps...)
	})
}

func TestScenario_MessageMultiMemberGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectInLine", 3, bertyprotocol.ConnectInLine, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"5 clients/connectInLine", 5, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"8 clients/connectInLine", 8, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 40},
		{"10 clients/connectInLine", 10, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		// Create MultiMember Group
		groupID := createMultiMemberGroup(ctx, t, tps...)

		// Each member sends 3 messages on MultiMember Group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, groupID, messages)
	})
}

//
//func TestScenario_MessageMultiMemberGroup2(t *testing.T) {
//	cases := []testCase{
//		{"2 clients/connectAll", 2, ConnectAll, testutil.Fast, testutil.Stable, time.Second * 60},
//	}
//
//	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*TestingProtocol) {
//		// Create MultiMember Group
//		groupID := createMultiMemberGroup(ctx, t, tps...)
//
//		const messageCount = 100
//		// Each member sends 3 messages on MultiMember Group
//		messages := make([]string, messageCount)
//		for i := 0; i < messageCount; i++ {
//			messages[i] = fmt.Sprintf("test%d", i)
//		}
//
//		sendMessageOnGroup(ctx, t, tps, tps, groupID, messages)
//	})
//}

func TestScenario_MessageSeveralMultiMemberGroups(t *testing.T) {
	const ngroup = 3

	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"3 clients/connectInLine", 3, bertyprotocol.ConnectInLine, testutil.Fast, testutil.Flappy, time.Second * 10},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"5 clients/connectInLine", 5, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 20},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"8 clients/connectInLine", 8, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 40},
		{"10 clients/connectInLine", 10, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Flappy, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
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
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 20},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 20},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 40},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 60},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		addAsContact(ctx, t, tps, tps)
	})
}

func TestScenario_MessageContactGroup(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 20},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Flappy, time.Second * 20},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Flappy, time.Second * 30},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 60},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		// Add accounts as contacts
		addAsContact(ctx, t, tps, tps)

		// Send messages between all accounts on contact groups
		messages := []string{"test1", "test2", "test3"}
		sendMessageToContact(ctx, t, messages, tps)
	})
}

func TestScenario_MessageAccountGroup(t *testing.T) {
	cases := []testCase{
		{"1 client/connectAll", 1, bertyprotocol.ConnectAll, testutil.Fast, testutil.Stable, time.Second * 10},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		// Get account config
		config, err := tps[0].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
		require.NoError(t, err)
		require.NotNil(t, config)

		// Send messages on account group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, config.AccountGroupPK, messages)
	})
}

func TestScenario_MessageAccountGroup_NonMocked(t *testing.T) {
	cases := []testCase{
		{"1 client/connectAll", 1, bertyprotocol.ConnectAll, testutil.Fast, testutil.Stable, time.Second * 10},
	}

	testingScenarioNonMocked(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
		// Get account config
		config, err := tps[0].Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
		require.NoError(t, err)
		require.NotNil(t, config)

		// Send messages on account group
		messages := []string{"test1", "test2", "test3"}
		sendMessageOnGroup(ctx, t, tps, tps, config.AccountGroupPK, messages)
	})
}

func TestScenario_MessageAccountAndMultiMemberGroups(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectInLine", 3, bertyprotocol.ConnectInLine, testutil.Fast, testutil.Broken, time.Second * 10},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 20},
		{"5 clients/connectInLine", 5, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 20},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 30},
		{"8 clients/connectInLine", 8, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 30},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
		{"10 clients/connectInLine", 10, bertyprotocol.ConnectInLine, testutil.Slow, testutil.Broken, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
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
			config, err := account.Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, config)

			// Send messages on account group
			messages = []string{"account1", "account2", "account3"}
			sendMessageOnGroup(ctx, t, []*bertyprotocol.TestingProtocol{account}, []*bertyprotocol.TestingProtocol{account}, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on MultiMember Group =====")
		// Each member sends 3 messages on MultiMember Group
		messages = []string{"test4", "test5", "test6"}
		sendMessageOnGroup(ctx, t, tps, tps, mmGroup, messages)
	})
}

func TestScenario_MessageAccountAndContactGroups(t *testing.T) {
	cases := []testCase{
		{"2 clients/connectAll", 2, bertyprotocol.ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"3 clients/connectAll", 3, bertyprotocol.ConnectAll, testutil.Fast, testutil.Broken, time.Second * 10},
		{"5 clients/connectAll", 5, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 20},
		{"8 clients/connectAll", 8, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 30},
		{"10 clients/connectAll", 10, bertyprotocol.ConnectAll, testutil.Slow, testutil.Broken, time.Second * 40},
	}

	testingScenario(t, cases, func(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) {
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
			config, err := account.Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, config)

			// Send messages on account group
			messages = []string{"account1", "account2", "account3"}
			sendMessageOnGroup(ctx, t, []*bertyprotocol.TestingProtocol{account}, []*bertyprotocol.TestingProtocol{account}, config.AccountGroupPK, messages)
		}

		t.Log("===== Send Messages again on Contact Group =====")
		// Send messages between all accounts on contact groups
		messages = []string{"contact4", "contact5", "contact6"}
		sendMessageToContact(ctx, t, messages, tps)
	})
}

func TestScenario_ReplicateMessage(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Stable, testutil.Slow)

	ctx, cancel, mn, rdvPeer := bertyprotocol.TestHelperIPFSSetUp(t)
	defer cancel()

	dsA := dsync.MutexWrap(ds.NewMapDatastore())
	nodeA, closeNodeA := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvPeer.Peerstore().PeerInfo(rdvPeer.ID()),
	}, dsA)
	defer closeNodeA()

	dsB := dsync.MutexWrap(ds.NewMapDatastore())
	nodeB, closeNodeB := bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvPeer.Peerstore().PeerInfo(rdvPeer.ID()),
	}, dsB)
	defer closeNodeB()

	tokenSecret, tokenPK, tokenSK := bertyauth.HelperGenerateTokenIssuerSecrets(t)

	replPeer, cancel := bertyreplication.NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvPeer.Peerstore().PeerInfo(rdvPeer.ID()),
	})
	defer cancel()

	err := mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	for _, net := range mn.Nets() {
		if net != rdvPeer.Network() {
			_, err = mn.ConnectNets(net, rdvPeer.Network())
			assert.NoError(t, err)
		}
	}

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	// Create MultiMember Group
	group := createMultiMemberGroupInstance(ctx, t, nodeA, nodeB)

	// TODO: handle services auth
	_ = tokenSK
	// issuer, err := NewAuthTokenIssuer(tokenSecret, tokenSK)
	// require.NoError(t, err)
	// token, err := issuer.IssueToken([]string{ServiceReplicationID})
	// require.NoError(t, err)
	//
	// _, err = nodeA.Service.(*service).accountGroup.MetadataStore.SendAccountServiceTokenAdded(ctx, &protocoltypes.ServiceToken{
	//	Token: token,
	//	SupportedServices: []*protocoltypes.ServiceTokenSupportedService{
	//		{
	//			ServiceType:     ServiceReplicationID,
	//			ServiceEndpoint: "", // TODO
	//		},
	//	},
	// })
	// require.NoError(t, err)

	groupReplicable, err := bertyprotocol.FilterGroupForReplication(group)
	require.NoError(t, err)

	subCtx := context.WithValue(ctx, authtypes.ContextTokenHashField, "token1")
	subCtx = context.WithValue(subCtx, authtypes.ContextTokenIssuerField, "issuer1")

	_, err = replPeer.Service.ReplicateGroup(subCtx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.NoError(t, err)

	// Replicating using same token should raise an error
	_, err = replPeer.Service.ReplicateGroup(subCtx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))

	subCtx = context.WithValue(ctx, authtypes.ContextTokenHashField, "token2")
	subCtx = context.WithValue(subCtx, authtypes.ContextTokenIssuerField, "issuer1")

	// Replicating using another token should not do anything but no error should be thrown
	_, err = replPeer.Service.ReplicateGroup(subCtx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.NoError(t, err)

	_, err = nodeA.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: group.PublicKey,
		Payload: []byte("test1"),
	})
	require.NoError(t, err)

	_, err = nodeB.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: group.PublicKey,
		Payload: []byte("test2"),
	})
	require.NoError(t, err)

	time.Sleep(time.Millisecond * 250)

	closeNodeB()

	_, err = nodeA.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: group.PublicKey,
		Payload: []byte("test3"),
	})
	require.NoError(t, err)

	time.Sleep(time.Second * 5)

	closeNodeA()

	nodeB, closeNodeB = bertyprotocol.NewTestingProtocol(ctx, t, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvPeer.Peerstore().PeerInfo(rdvPeer.ID()),
	}, dsB)
	defer closeNodeB()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	_, err = nodeB.Service.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: group.PublicKey,
	})

	time.Sleep(time.Second * 5)

	msgList, err := nodeB.Client.GroupMessageList(ctx, &protocoltypes.GroupMessageList_Request{GroupPK: group.PublicKey, UntilNow: true})
	require.NoError(t, err)

	expectedMsgs := map[string]struct{}{
		"test1": {},
		"test2": {},
		"test3": {},
	}

	for {
		msg, err := msgList.Recv()
		if err != nil {
			require.ErrorIs(t, err, io.EOF)
			break
		}

		_, ok := expectedMsgs[string(msg.Message)]
		require.True(t, ok)
		delete(expectedMsgs, string(msg.Message))
	}

	require.Empty(t, expectedMsgs)
}

// Helpers

func testingScenario(t *testing.T, tcs []testCase, tf testFunc) {
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

			opts := bertyprotocol.TestingOpts{
				Mocknet:     libp2p_mocknet.New(ctx),
				Logger:      logger,
				ConnectFunc: tc.ConnectFunc,
			}

			tps, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, tc.NumberOfClient)
			defer cleanup()

			var cctx context.Context

			if tc.Timeout > 0 {
				cctx, cancel = context.WithTimeout(ctx, tc.Timeout)
			} else {
				cctx, cancel = context.WithCancel(ctx)
			}

			tf(cctx, t, tps...)
			cancel()
		})
	}
}

func testingScenarioNonMocked(t *testing.T, tcs []testCase, tf testFunc) {
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

			opts := bertyprotocol.TestingOpts{
				Mocknet:     libp2p_mocknet.New(ctx),
				Logger:      logger,
				ConnectFunc: tc.ConnectFunc,
			}

			tps, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &opts, nil, tc.NumberOfClient)
			defer cleanup()

			var cctx context.Context

			if tc.Timeout > 0 {
				cctx, cancel = context.WithTimeout(ctx, tc.Timeout)
			} else {
				cctx, cancel = context.WithCancel(ctx)
			}

			tf(cctx, t, tps...)
			cancel()
		})
	}
}

func createMultiMemberGroupInstance(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) *protocoltypes.Group {
	testutil.LogTree(t, "Create and Join MultiMember Group", 0, true)
	start := time.Now()

	ntps := len(tps)

	// Create group
	group, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	// Get Instance Configurations
	{
		testutil.LogTree(t, "Get Instance Configuration", 1, true)
		start := time.Now()

		// check if everything is ready
		for _, pt := range tps {
			_, err := pt.Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
		}

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Join Group
	{
		testutil.LogTree(t, "Join Group", 1, true)
		start := time.Now()

		for _, pt := range tps {
			req := protocoltypes.MultiMemberGroupJoin_Request{
				Group: group,
			}

			// pt join group
			_, err = pt.Client.MultiMemberGroupJoin(ctx, &req)
			require.NoError(t, err)
		}

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Get Member/Device PKs
	memberPKs := make([][]byte, ntps)
	devicePKs := make([][]byte, ntps)
	{
		testutil.LogTree(t, "Get Member/Device PKs", 1, true)
		start := time.Now()

		for i, pt := range tps {
			res, err := pt.Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
				GroupPK: group.PublicKey,
			})
			require.NoError(t, err)
			assert.Equal(t, group.PublicKey, res.Group.PublicKey)

			memberPKs[i] = res.MemberPK
			devicePKs[i] = res.DevicePK
		}

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Activate Group
	{
		testutil.LogTree(t, "Activate Group", 1, true)
		start := time.Now()

		for i, pt := range tps {
			_, err := pt.Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
				GroupPK: group.PublicKey,
			})

			assert.NoError(t, err, fmt.Sprintf("error for client %d", i))
		}

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Exchange Secrets
	{
		testutil.LogTree(t, "Exchange Secrets", 1, true)
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

				sub, inErr := tp.Client.GroupMetadataList(ctx, &protocoltypes.GroupMetadataList_Request{
					GroupPK: group.PublicKey,
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

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	testutil.LogTree(t, "duration: %s", 0, false, time.Since(start))

	return group
}

func createMultiMemberGroup(ctx context.Context, t *testing.T, tps ...*bertyprotocol.TestingProtocol) (groupID []byte) {
	return createMultiMemberGroupInstance(ctx, t, tps...).PublicKey
}

func addAsContact(ctx context.Context, t *testing.T, senders, receivers []*bertyprotocol.TestingProtocol) {
	testutil.LogTree(t, "Add Senders/Receivers as Contact", 0, true)
	start := time.Now()
	var sendDuration, receiveDuration, acceptDuration, activateDuration time.Duration

	for i, sender := range senders {
		for _, receiver := range receivers {
			substart := time.Now()

			// Get sender/receiver configs
			senderCfg, err := sender.Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, senderCfg)
			receiverCfg, err := receiver.Client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
			require.NoError(t, err)
			require.NotNil(t, receiverCfg)

			// Setup receiver's shareable contact
			var receiverRDVSeed []byte

			crf, err := receiver.Client.ContactRequestReference(ctx, &protocoltypes.ContactRequestReference_Request{})
			if err != nil || !crf.Enabled || len(crf.PublicRendezvousSeed) == 0 {
				_, err = receiver.Client.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})
				require.NoError(t, err)
				receiverRDV, err := receiver.Client.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})
				require.NoError(t, err)
				require.NotNil(t, receiverRDV)
				receiverRDVSeed = receiverRDV.PublicRendezvousSeed
			} else {
				receiverRDVSeed = crf.PublicRendezvousSeed
			}

			receiverSharableContact := &protocoltypes.ShareableContact{
				PK:                   receiverCfg.AccountPK,
				PublicRendezvousSeed: receiverRDVSeed,
			}

			// Sender sends contact request
			_, err = sender.Client.ContactRequestSend(ctx, &protocoltypes.ContactRequestSend_Request{
				Contact: receiverSharableContact,
			})

			// Check if sender and receiver are the same account, should return the right error and skip
			if bytes.Equal(senderCfg.AccountPK, receiverCfg.AccountPK) {
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
			subReceiver, err := receiver.Client.GroupMetadataList(subCtx, &protocoltypes.GroupMetadataList_Request{
				GroupPK: receiverCfg.AccountGroupPK,
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

				if evt == nil || evt.Metadata.EventType != protocoltypes.EventTypeAccountContactRequestIncomingReceived {
					continue
				}

				req := &protocoltypes.AccountContactRequestReceived{}
				err = req.Unmarshal(evt.Event)

				require.NoError(t, err)

				if bytes.Equal(senderCfg.AccountPK, req.ContactPK) {
					found = true
					break
				}
			}

			subCancel()
			require.True(t, found)

			receiveDuration += time.Since(substart)
			substart = time.Now()

			// Receiver accepts contact request
			_, err = receiver.Client.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
				ContactPK: senderCfg.AccountPK,
			})

			require.NoError(t, err)

			acceptDuration += time.Since(substart)
			substart = time.Now()

			// Both receiver and sender activate the contact group
			grpInfo, err := sender.Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
				ContactPK: receiverCfg.AccountPK,
			})
			require.NoError(t, err)

			_, err = sender.Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
				GroupPK: grpInfo.Group.PublicKey,
			})

			require.NoError(t, err)

			grpInfo2, err := receiver.Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
				ContactPK: senderCfg.AccountPK,
			})
			require.NoError(t, err)

			require.Equal(t, grpInfo.Group.PublicKey, grpInfo2.Group.PublicKey)

			_, err = receiver.Client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
				GroupPK: grpInfo2.Group.PublicKey,
			})

			require.NoError(t, err)

			activateDuration += time.Since(substart)
			substart = time.Now()
		}
	}

	testutil.LogTree(t, "Send Contact Requests", 1, true)
	testutil.LogTree(t, "duration: %s", 1, false, sendDuration)
	testutil.LogTree(t, "Receive Contact Requests", 1, true)
	testutil.LogTree(t, "duration: %s", 1, false, receiveDuration)
	testutil.LogTree(t, "Accept Contact Requests", 1, true)
	testutil.LogTree(t, "duration: %s", 1, false, acceptDuration)
	testutil.LogTree(t, "Activate Contact Groups", 1, true)
	testutil.LogTree(t, "duration: %s", 1, false, activateDuration)

	testutil.LogTree(t, "duration: %s", 0, false, time.Since(start))
}

func sendMessageToContact(ctx context.Context, t *testing.T, messages []string, tps []*bertyprotocol.TestingProtocol) {
	for _, sender := range tps {
		for _, receiver := range tps {
			// Don't try to send messages to itself using contact group
			if sender == receiver {
				continue
			}

			// Get contact group
			contactGroup, err := sender.Client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
				ContactPK: getAccountPubKey(t, receiver),
			})
			require.NoError(t, err)
			require.NotNil(t, contactGroup)

			// Send messages on contact group
			sendMessageOnGroup(ctx, t, []*bertyprotocol.TestingProtocol{sender}, []*bertyprotocol.TestingProtocol{receiver}, contactGroup.Group.PublicKey, messages)
		}
	}
}

func sendMessageOnGroup(ctx context.Context, t *testing.T, senders, receivers []*bertyprotocol.TestingProtocol, groupPK []byte, messages []string) {
	testutil.LogTree(t, "Send, Receive and List Messages", 0, true)
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
		testutil.LogTree(t, "Senders Send Messages", 1, true)
		start := time.Now()

		for _, sender := range senders {
			senderID := getAccountB64PubKey(t, sender)
			for _, message := range messages {
				_, err := sender.Client.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
					GroupPK: groupPK,
					Payload: []byte(senderID + " - " + message),
				})

				require.NoError(t, err)
			}
		}

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Receivers receive all expected messages
	{
		testutil.LogTree(t, "Receivers Receive Messages (subscription)", 1, true)
		start := time.Now()

		var wg sync.WaitGroup
		wg.Add(len(receivers))

		for _, receiver := range receivers {
			// Subscribe receivers to wait for incoming messages
			go func(receiver *bertyprotocol.TestingProtocol) {
				subCtx, subCancel := context.WithCancel(ctx)
				defer subCancel()
				defer wg.Done()

				sub, err := receiver.Client.GroupMessageList(subCtx, &protocoltypes.GroupMessageList_Request{
					GroupPK: groupPK,
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

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}

	// Receivers list all expected messages
	{
		testutil.LogTree(t, "Receivers List Messages (store)", 1, true)
		start := time.Now()

		var wg sync.WaitGroup
		wg.Add(len(receivers))

		for _, receiver := range receivers {
			// Subscribe receivers to wait for incoming messages
			go func(receiver *bertyprotocol.TestingProtocol) {
				subCtx, subCancel := context.WithCancel(ctx)
				defer subCancel()
				defer wg.Done()

				req := protocoltypes.GroupMessageList_Request{
					GroupPK:  groupPK,
					UntilNow: true,
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

		testutil.LogTree(t, "duration: %s", 1, false, time.Since(start))
	}
	testutil.LogTree(t, "duration: %s", 0, false, time.Since(start))
}

func isEventAddSecretTargetedToMember(ownRawPK []byte, evt *protocoltypes.GroupMetadataEvent) ([]byte, error) {
	// Only count EventTypeGroupDeviceSecretAdded events
	if evt.Metadata.EventType != protocoltypes.EventTypeGroupDeviceSecretAdded {
		return nil, nil
	}

	sec := &protocoltypes.GroupAddDeviceSecret{}
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

func getAccountPubKey(t *testing.T, tp *bertyprotocol.TestingProtocol) []byte {
	t.Helper()

	tpSK, err := tp.Opts.DeviceKeystore.AccountPrivKey()
	require.NoError(t, err)
	tpPK, err := tpSK.GetPublic().Raw()
	require.NoError(t, err)

	return tpPK
}

func getAccountB64PubKey(t *testing.T, tp *bertyprotocol.TestingProtocol) string {
	t.Helper()

	tpPK := getAccountPubKey(t, tp)

	return base64.StdEncoding.EncodeToString(tpPK)
}
