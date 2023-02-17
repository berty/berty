package bertyreplication

import (
	"context"
	"crypto/ed25519"
	"fmt"
	"testing"
	"time"

	sqlite "github.com/flyingtime/gorm-sqlcipher"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"moul.io/zapgorm2"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	orbitdb "berty.tech/go-orbit-db"
)

type TestingReplicationPeer struct {
	Service ReplicationService
}

func DBForTests(t testing.TB, logger *zap.Logger) (*gorm.DB, func()) {
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

	return db, func() {
		sqlDB, err := db.DB()
		require.NoError(t, err)
		sqlDB.Close()
	}
}

func TestHelperNewReplicationService(ctx context.Context, t *testing.T, logger *zap.Logger, mn libp2p_mocknet.Mocknet, msrv *tinder.MockDriverServer, ds datastore.Batching, db *gorm.DB) *replicationService {
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
	odb, err := bertyprotocol.NewBertyOrbitDB(ctx, api.API(), &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: logger,
			Cache:  bertyprotocol.NewOrbitDatastoreCache(ds),
		},
	})
	require.NoError(t, err)

	repl, err := NewReplicationService(ctx, db, odb, logger)
	require.NoError(t, err)
	require.NotNil(t, repl)

	svc, ok := repl.(*replicationService)
	require.True(t, ok)

	return svc
}

func NewReplicationMockedPeer(ctx context.Context, t *testing.T, secret []byte, sk ed25519.PublicKey, opts *bertyprotocol.TestingOpts) (*TestingReplicationPeer, func()) {
	// TODO: handle auth
	_ = secret
	_ = sk

	db, cleanup := DBForTests(t, zap.NewNop())
	replServ := TestHelperNewReplicationService(ctx, t, opts.Logger, opts.Mocknet, opts.DiscoveryServer, nil, db)

	return &TestingReplicationPeer{
		Service: replServ,
	}, cleanup
}
