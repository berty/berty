package bertyprotocol

import (
	"context"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/host"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	orbitdb "berty.tech/go-orbit-db"
)

func testHelperIPFSSetUp(t *testing.T) (context.Context, context.CancelFunc, mocknet.Mocknet, host.Host) {
	t.Helper()

	ctx, cancel := context.WithCancel(context.Background())

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	return ctx, cancel, mn, rdvp
}

func TestNewReplicationService(t *testing.T) {
	ctx, cancel, mn, rdvp := testHelperIPFSSetUp(t)
	defer cancel()

	ds := dssync.MutexWrap(datastore.NewMapDatastore())
	api, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})
	defer cleanup()

	orbitdbCache := NewOrbitDatastoreCache(ds)

	odb, err := NewBertyOrbitDB(ctx, api.API(), &NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: zap.NewNop(),
			Cache:  orbitdbCache,
		},
	})
	require.NoError(t, err)

	repl, err := NewReplicationService(ctx, ds, odb, zap.NewNop())
	require.NoError(t, err)
	require.NotNil(t, repl)
}

func TestReplicationService_GroupSubscribe(t *testing.T) {
	ctx, cancel, mn, rdvp := testHelperIPFSSetUp(t)
	defer cancel()

	repl, cancel := testHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), nil)
	defer cancel()

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := g.FilterForReplication()
	require.NoError(t, err)

	err = repl.GroupSubscribe(replGroup)
	require.NoError(t, err)

	err = repl.GroupSubscribe(&protocoltypes.Group{
		PublicKey: nil,
	})
	require.Error(t, err)

	err = repl.GroupSubscribe(&protocoltypes.Group{
		PublicKey: nil,
	})
	require.Error(t, err)
}

func TestReplicationService_GroupRegister(t *testing.T) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	ctx, cancel, mn, rdvp := testHelperIPFSSetUp(t)
	defer cancel()

	repl, cancel := testHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), ds)
	cancel()

	g, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := g.FilterForReplication()
	require.NoError(t, err)

	err = repl.GroupRegister("token", replGroup)
	require.NoError(t, err)

	err = repl.Close()
	require.NoError(t, err)
	cancel()

	// Test reopening the replication manager, the previously registered group should be present
	repl, cancel = testHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), ds)
	defer cancel()

	gc, ok := repl.odb.groups.Load(g.GroupIDAsString())
	require.True(t, ok)
	require.NotNil(t, gc)
}

func TestReplicationService_Flow(t *testing.T) {
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pathBase, err := ioutil.TempDir("", "odb_replication_service")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(pathBase)

	baseDS, err := accountutils.GetRootDatastoreForPath(pathBase, zap.NewNop())
	require.NoError(t, err)

	defer baseDS.Close()

	baseDS = dssync.MutexWrap(baseDS)

	defer baseDS.Close()

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	defer rdvp.Close()

	_, cleanrdvp := ipfsutil.TestingRDVP(ctx, t, rdvp)
	defer cleanrdvp()

	ipfsOpts1 := &ipfsutil.TestingAPIOpts{
		Logger:    logger,
		Mocknet:   mn,
		RDVPeer:   rdvp.Peerstore().PeerInfo(rdvp.ID()),
		Datastore: datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer1")),
	}

	ipfsOpts2 := &ipfsutil.TestingAPIOpts{
		Logger:    logger,
		Mocknet:   mn,
		RDVPeer:   rdvp.Peerstore().PeerInfo(rdvp.ID()),
		Datastore: datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer2")),
	}

	require.NoError(t, mn.ConnectAllButSelf())

	api1, cleanupAPI1 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts1)
	odb1 := newTestOrbitDB(ctx, t, logger, api1, ipfsOpts1.Datastore)
	api2, cleanupAPI2 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts2)
	odb2 := newTestOrbitDB(ctx, t, logger, api2, ipfsOpts2.Datastore)

	tokenSecret, tokenPK, _ := helperGenerateTokenIssuerSecrets(t)
	replPeer, cancel := NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})
	defer cancel()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	gA, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	g1a, err := odb1.openGroup(ctx, gA, nil)
	require.NoError(t, err)

	g2a, err := odb2.openGroup(ctx, gA, nil)
	require.NoError(t, err)

	require.NoError(t, ActivateGroupContext(ctx, g1a, nil))
	require.NoError(t, ActivateGroupContext(ctx, g2a, nil))

	groupReplicable, err := gA.FilterForReplication()
	require.NoError(t, err)

	t.Log(" --- Register group on replication service ---")

	// TODO: handle auth
	_, err = replPeer.Service.ReplicateGroup(ctx, &protocoltypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.NoError(t, err)

	t.Log(" --- Registered group on replication service ---")
	t.Log(" --- Sending sync messages ---")

	_, err = g1a.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 1"), nil)
	require.NoError(t, err)

	_, err = g2a.MetadataStore().SendAppMetadata(ctx, []byte("From 2 - 1"), nil)
	require.NoError(t, err)

	t.Log(" --- Sent sync messages ---")

	time.Sleep(time.Millisecond * 250)

	evts1, err := g1a.MetadataStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)
	ops1 := testFilterAppMetadata(t, evts1)
	require.NoError(t, err)

	evts2, err := g2a.MetadataStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)
	ops2 := testFilterAppMetadata(t, evts2)
	require.NoError(t, err)

	assert.Equal(t, 2, len(ops1))
	assert.Equal(t, 2, len(ops2))

	odb2.Close()
	cleanupAPI2()

	t.Log(" --- Closed peer 2 ---")
	t.Log(" --- Sending async messages ---")

	_, err = g1a.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 2"), nil)
	require.NoError(t, err)

	time.Sleep(time.Millisecond * 250)

	t.Log(" --- Sent async messages, should be replicated on service ---")

	odb1.Close()
	cleanupAPI1()

	t.Log(" --- Closed peer 1 ---")


	api2, cleanupAPI2 = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts2)
	defer cleanupAPI2()

	t.Log(" --- Opening peer 2, and its db ---")

	odb2 = newTestOrbitDB(ctx, t, logger, api2, ipfsOpts2.Datastore)
	defer odb2.Close()

	err = mn.LinkAll()
	require.NoError(t, err)

	g2a, err = odb2.openGroup(ctx, gA, nil)
	require.NoError(t, err)

	time.Sleep(1000 * time.Millisecond)

	t.Log(" --- Waited for peer 2 to replicate data ---")

	evts2, err = g2a.MetadataStore().ListEvents(ctx, nil, nil, false)
	require.NoError(t, err)
	ops2 = testFilterAppMetadata(t, evts2)
	require.NoError(t, err)

	assert.Equal(t, 3, len(ops2))
}
