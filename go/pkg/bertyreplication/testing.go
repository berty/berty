package bertyreplication

import (
	"context"
	"crypto/ed25519"
	"fmt"
	"io"
	"testing"
	"time"

	"github.com/ipfs/go-datastore"
	ds "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"github.com/tj/assert"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	sqlite "berty.tech/berty/v2/go/internal/gorm-sqlcipher"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/weshnet/v2"
	"berty.tech/weshnet/v2/pkg/ipfsutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/replicationtypes"
	"berty.tech/weshnet/v2/pkg/testutil"
	"berty.tech/weshnet/v2/pkg/tinder"
)

type TestingReplicationPeer struct {
	CoreAPI ipfsutil.CoreAPIMock
	Service ReplicationService
}

func DBForTests(t testing.TB, logger *zap.Logger) *gorm.DB {
	if logger == nil {
		logger = zap.NewNop()
	}

	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:memdb_%d?mode=memory&cache=shared", time.Now().UnixNano())), &gorm.Config{
		Logger:                                   zapgorm2.New(logger),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		require.NoError(t, err)
	}

	sqlDB, err := db.DB()
	require.NoError(t, err)

	t.Cleanup(func() { _ = sqlDB.Close() })

	return db
}

func TestHelperNewReplicationService(ctx context.Context, t *testing.T, logger *zap.Logger, mn mocknet.Mocknet, msrv *tinder.MockDriverServer, ds datastore.Batching, db *gorm.DB) (*replicationService, ipfsutil.CoreAPIMock) {
	t.Helper()

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	api := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsutil.TestingAPIOpts{
		Logger:          logger,
		Mocknet:         mn,
		DiscoveryServer: msrv,
		Datastore:       ds,
	})

	odb, err := weshnet.NewWeshOrbitDB(ctx, api.API(), &weshnet.NewOrbitDBOptions{
		// GroupMetadataStoreType: initutil.DefaultBertyGroupMetadataStoreType,
		// GroupMessageStoreType:  initutil.DefaultBertyGroupMessageStoreType,
		ReplicationMode: true,
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: logger,
			Cache:  weshnet.NewOrbitDatastoreCache(ds),
		},
	})
	require.NoError(t, err)

	repl, err := NewReplicationService(ctx, db, odb, logger)
	require.NoError(t, err)
	require.NotNil(t, repl)

	svc, ok := repl.(*replicationService)
	require.True(t, ok)

	return svc, api
}

func NewReplicationMockedPeer(ctx context.Context, t *testing.T, secret []byte, sk ed25519.PublicKey, opts *weshnet.TestingOpts) *TestingReplicationPeer {
	// TODO: handle auth
	_ = secret
	_ = sk

	db := DBForTests(t, zap.NewNop())

	replServ, api := TestHelperNewReplicationService(ctx, t, opts.Logger, opts.Mocknet, opts.DiscoveryServer, nil, db)

	return &TestingReplicationPeer{
		CoreAPI: api,
		Service: replServ,
	}
}

func TestReplicateMessage(t *testing.T) {
	testutil.FilterStabilityAndSpeed(t, testutil.Broken, testutil.Slow)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()

	dsA := ds_sync.MutexWrap(ds.NewMapDatastore())
	nodeA, closeNodeA := weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{
		Logger:          logger.Named("nodeA"),
		Mocknet:         mn,
		DiscoveryServer: msrv,
	}, dsA)
	defer closeNodeA()

	dsB := ds_sync.MutexWrap(ds.NewMapDatastore())
	nodeB, closeNodeB := weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{
		Logger:          logger.Named("nodeB"),
		Mocknet:         mn,
		DiscoveryServer: msrv,
	}, dsB)
	defer closeNodeB()

	tokenSecret, tokenPK, tokenSK := bertyauth.HelperGenerateTokenIssuerSecrets(t)

	replPeer := NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &weshnet.TestingOpts{
		Logger:          logger.Named("repl"),
		Mocknet:         mn,
		DiscoveryServer: msrv,
	})
	defer cancel()

	err := mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	// Create MultiMember Group
	group := weshnet.CreateMultiMemberGroupInstance(ctx, t, nodeA, nodeB)

	// TODO: handle services auth
	_ = tokenSK
	// issuer, err := NewAuthTokenIssuer(tokenSecret, tokenSK)
	// require.NoError(t, err)
	// token, err := issuer.IssueToken([]string{ServiceReplicationID})
	// require.NoError(t, err)
	//
	// _, err = nodeA.Service.(*service).getAccountGroup().MetadataStore.SendAccountServiceTokenAdded(ctx, &protocoltypes.ServiceToken{
	//	Token: token,
	//	SupportedServices: []*protocoltypes.ServiceTokenSupportedService{
	//		{
	//			ServiceType:     ServiceReplicationID,
	//			ServiceEndpoint: "", // TODO
	//		},
	//	},
	// })
	// require.NoError(t, err)

	groupReplicable, err := weshnet.FilterGroupForReplication(group)
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
	require.True(t, errcode.Is(err, errcode.ErrCode_ErrDBEntryAlreadyExists))

	subCtx = context.WithValue(ctx, authtypes.ContextTokenHashField, "token2")
	subCtx = context.WithValue(subCtx, authtypes.ContextTokenIssuerField, "issuer1")

	// Replicating using another token should not do anything but no error should be thrown
	_, err = replPeer.Service.ReplicateGroup(subCtx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.NoError(t, err)

	_, err = nodeA.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPk: group.PublicKey,
		Payload: []byte("test1"),
	})
	require.NoError(t, err)

	_, err = nodeB.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPk: group.PublicKey,
		Payload: []byte("test2"),
	})
	require.NoError(t, err)

	time.Sleep(time.Millisecond * 250)

	closeNodeB()

	_, err = nodeA.Service.AppMessageSend(ctx, &protocoltypes.AppMessageSend_Request{
		GroupPk: group.PublicKey,
		Payload: []byte("test3"),
	})
	require.NoError(t, err)

	time.Sleep(time.Second * 5)

	closeNodeA()

	nodeB, closeNodeB = weshnet.NewTestingProtocol(ctx, t, &weshnet.TestingOpts{
		Logger:          logger.Named("nodeB"),
		Mocknet:         mn,
		DiscoveryServer: msrv,
	}, dsB)
	defer closeNodeB()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	_, err = nodeB.Service.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPk: group.PublicKey,
	})
	assert.NoError(t, err)

	time.Sleep(time.Second * 5)

	msgList, err := nodeB.Client.GroupMessageList(ctx, &protocoltypes.GroupMessageList_Request{GroupPk: group.PublicKey, UntilNow: true})
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
