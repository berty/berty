package bertyreplication_test

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/bertyreplication"
	"berty.tech/berty/v2/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/weshnet"
	"berty.tech/weshnet/pkg/authtypes"
	"berty.tech/weshnet/pkg/bertyauth"
	"berty.tech/weshnet/pkg/ipfsutil"
	"berty.tech/weshnet/pkg/protocoltypes"
	"berty.tech/weshnet/pkg/replicationtypes"
	"berty.tech/weshnet/pkg/testutil"
	"berty.tech/weshnet/pkg/tinder"
)

func TestNewReplicationService(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	ds := dssync.MutexWrap(datastore.NewMapDatastore())
	api := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsutil.TestingAPIOpts{
		Mocknet:         mn,
		DiscoveryServer: tinder.NewMockDriverServer(),
	})

	orbitdbCache := weshnet.NewOrbitDatastoreCache(ds)

	odb, err := weshnet.NewWeshOrbitDB(ctx, api.API(), &weshnet.NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: zap.NewNop(),
			Cache:  orbitdbCache,
		},
	})
	require.NoError(t, err)

	db := bertyreplication.DBForTests(t, nil)

	repl, err := bertyreplication.NewReplicationService(ctx, db, odb, zap.NewNop())
	require.NoError(t, err)
	require.NotNil(t, repl)
}

func TestReplicationService_GroupSubscribe(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()

	db := bertyreplication.DBForTests(t, zap.NewNop())

	repl, _ := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, msrv, nil, db)

	g, _, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := weshnet.FilterGroupForReplication(g)
	require.NoError(t, err)

	err = repl.GroupSubscribe(replGroup, messengerutil.B64EncodeBytes(replGroup.PublicKey))
	require.NoError(t, err)

	err = repl.GroupSubscribe(&protocoltypes.Group{
		PublicKey: nil,
	}, "")
	require.Error(t, err)
}

func TestReplicationService_GroupRegister(t *testing.T) {
	testutil.FilterStability(t, testutil.Flappy)

	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()

	db := bertyreplication.DBForTests(t, zap.NewNop())

	repl, _ := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, msrv, ds, db)

	g, _, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := weshnet.FilterGroupForReplication(g)
	require.NoError(t, err)

	err = repl.GroupRegister("token", "issuer", replGroup)
	require.NoError(t, err)

	err = repl.GroupRegister("token", "issuer", replGroup)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))

	err = repl.GroupRegister("token2", "issuer", replGroup)
	require.NoError(t, err)

	err = repl.GroupRegister("token2", "issuer", replGroup)
	require.Error(t, err)
	require.True(t, errcode.Is(err, errcode.ErrDBEntryAlreadyExists))

	err = repl.Close()
	require.NoError(t, err)
	cancel()

	// Test reopening the replication manager, the previously registered group should be present
	repl, _ = bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, msrv, ds, db)

	ok := repl.OrbitDB().IsGroupLoaded(g.GroupIDAsString())
	require.True(t, ok)
}

func TestReplicationService_ReplicateGroupStats_ReplicateGlobalStats(t *testing.T) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()

	peer1DS := dssync.MutexWrap(datastore.NewMapDatastore())

	ipfsOpts1 := &ipfsutil.TestingAPIOpts{
		Logger:          zap.NewNop(),
		Mocknet:         mn,
		DiscoveryServer: msrv,
		Datastore:       datastoreutil.NewNamespacedDatastore(peer1DS, datastore.NewKey("peer1")),
	}

	api1 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts1)
	odb1 := weshnet.NewTestOrbitDB(ctx, t, zap.NewNop(), api1, ipfsOpts1.Datastore)

	db := bertyreplication.DBForTests(t, zap.NewNop())

	repl, _ := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, msrv, ds, db)

	require.NoError(t, mn.LinkAll())
	require.NoError(t, mn.ConnectAllButSelf())

	globalStats, err := repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
	require.NoError(t, err)

	require.Equal(t, int64(0), globalStats.ReplicatedGroups)
	require.NotEqual(t, int64(0), globalStats.StartedAt)
	require.Equal(t, int64(0), globalStats.TotalMetadataEntries)
	require.Equal(t, int64(0), globalStats.TotalMessageEntries)

	startedAt := globalStats.StartedAt

	g, _, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := weshnet.FilterGroupForReplication(g)
	require.NoError(t, err)

	err = repl.GroupRegister("token", "issuer", replGroup)
	require.NoError(t, err)

	globalStats, err = repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
	require.NoError(t, err)

	require.Equal(t, int64(1), globalStats.ReplicatedGroups)
	require.Equal(t, startedAt, globalStats.StartedAt)
	require.Equal(t, int64(0), globalStats.TotalMetadataEntries)
	require.Equal(t, int64(0), globalStats.TotalMessageEntries)

	_, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{})
	require.Error(t, err)

	_, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes([]byte("invalid_pk")),
	})
	require.Error(t, err)

	res, err := repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes(replGroup.PublicKey),
	})
	require.NoError(t, err)

	t.Logf("%+v", res.GetGroup())

	require.Equal(t, messengerutil.B64EncodeBytes(replGroup.PublicKey), res.Group.PublicKey)
	require.Equal(t, "", res.Group.SignPub)
	require.Equal(t, "", res.Group.LinkKey)
	require.Equal(t, int64(0), res.Group.MessageEntriesCount)
	require.Equal(t, int64(0), res.Group.MetadataEntriesCount)
	require.Equal(t, "", res.Group.MessageLatestHead)
	require.Equal(t, "", res.Group.MetadataLatestHead)
	require.NotEqual(t, int64(0), res.Group.CreatedAt)
	require.NotEqual(t, int64(0), res.Group.UpdatedAt)

	previousCreatedAt := res.Group.CreatedAt
	previousUpdatedAt := res.Group.UpdatedAt

	gcPeer1, err := odb1.OpenGroup(ctx, g, nil)
	require.NoError(t, err)
	defer gcPeer1.Close()

	opMeta, err := gcPeer1.MetadataStore().SendAppMetadata(ctx, []byte("meta_1"))
	require.NoError(t, err)

	deadline := time.Now().Add(5 * time.Second)
	for {
		globalStats, err = repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
		require.NoError(t, err)

		if time.Now().After(deadline) {
			t.Fatal("didn't see result in time")
		}

		if globalStats.TotalMetadataEntries != 1 {
			time.Sleep(100 * time.Millisecond)
			continue
		}

		require.Equal(t, int64(1), globalStats.ReplicatedGroups)
		require.Equal(t, startedAt, globalStats.StartedAt)
		require.Equal(t, int64(1), globalStats.TotalMetadataEntries)
		require.Equal(t, int64(0), globalStats.TotalMessageEntries)
		break
	}

	res, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes(replGroup.PublicKey),
	})
	require.NoError(t, err)

	t.Logf("%+v", res.GetGroup())

	require.Equal(t, messengerutil.B64EncodeBytes(replGroup.PublicKey), res.Group.PublicKey)
	require.Equal(t, "", res.Group.SignPub)
	require.Equal(t, "", res.Group.LinkKey)
	require.NotEqual(t, int64(0), res.Group.CreatedAt)
	require.NotEqual(t, int64(0), res.Group.UpdatedAt)
	require.Equal(t, previousCreatedAt, res.Group.CreatedAt)
	require.NotEqual(t, previousUpdatedAt, res.Group.UpdatedAt)
	require.Equal(t, int64(0), res.Group.MessageEntriesCount)
	require.Equal(t, int64(1), res.Group.MetadataEntriesCount)
	require.Equal(t, "", res.Group.MessageLatestHead)
	require.Equal(t, opMeta.GetEntry().GetHash().String(), res.Group.MetadataLatestHead)

	previousUpdatedAt = res.Group.UpdatedAt

	opMsg, err := gcPeer1.MessageStore().AddMessage(ctx, []byte("hey"))
	require.NoError(t, err)

	deadline = time.Now().Add(5 * time.Second)
	for {
		globalStats, err = repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
		require.NoError(t, err)

		if time.Now().After(deadline) {
			t.Fatal("didn't see result in time")
		}

		if globalStats.TotalMessageEntries != 1 {
			time.Sleep(100 * time.Millisecond)
			continue
		}

		require.Equal(t, int64(1), globalStats.ReplicatedGroups)
		require.Equal(t, startedAt, globalStats.StartedAt)
		require.Equal(t, int64(1), globalStats.TotalMetadataEntries)
		require.Equal(t, int64(1), globalStats.TotalMessageEntries)
		break
	}

	res, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes(replGroup.PublicKey),
	})
	require.NoError(t, err)

	t.Logf("%+v", res.GetGroup())

	require.Equal(t, messengerutil.B64EncodeBytes(replGroup.PublicKey), res.Group.PublicKey)
	require.Equal(t, "", res.Group.SignPub)
	require.Equal(t, "", res.Group.LinkKey)
	require.NotEqual(t, int64(0), res.Group.CreatedAt)
	require.NotEqual(t, int64(0), res.Group.UpdatedAt)
	require.Equal(t, previousCreatedAt, res.Group.CreatedAt)
	require.NotEqual(t, previousUpdatedAt, res.Group.UpdatedAt)
	require.Equal(t, opMsg.GetEntry().GetHash().String(), res.Group.MessageLatestHead)
	require.Equal(t, opMeta.GetEntry().GetHash().String(), res.Group.MetadataLatestHead)
	require.Equal(t, int64(1), res.Group.MessageEntriesCount)
	require.Equal(t, int64(1), res.Group.MetadataEntriesCount)

	previousUpdatedAt = res.Group.UpdatedAt

	opMsg2, err := gcPeer1.MessageStore().AddMessage(ctx, []byte("hey 2"))
	require.NoError(t, err)

	deadline = time.Now().Add(5 * time.Second)
	for {
		globalStats, err = repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
		require.NoError(t, err)

		if time.Now().After(deadline) {
			t.Fatal("didn't see result in time")
		}

		if globalStats.TotalMessageEntries != 2 {
			time.Sleep(100 * time.Millisecond)
			continue
		}

		require.Equal(t, int64(1), globalStats.ReplicatedGroups)
		require.Equal(t, startedAt, globalStats.StartedAt)
		require.Equal(t, int64(1), globalStats.TotalMetadataEntries)
		require.Equal(t, int64(2), globalStats.TotalMessageEntries)
		break
	}

	res, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes(replGroup.PublicKey),
	})
	require.NoError(t, err)

	t.Logf("%+v", res.GetGroup())

	require.Equal(t, messengerutil.B64EncodeBytes(replGroup.PublicKey), res.Group.PublicKey)
	require.Equal(t, "", res.Group.SignPub)
	require.Equal(t, "", res.Group.LinkKey)
	require.NotEqual(t, int64(0), res.Group.CreatedAt)
	require.NotEqual(t, int64(0), res.Group.UpdatedAt)
	require.Equal(t, previousCreatedAt, res.Group.CreatedAt)
	require.NotEqual(t, previousUpdatedAt, res.Group.UpdatedAt)
	require.Equal(t, opMsg2.GetEntry().GetHash().String(), res.Group.MessageLatestHead)
	require.Equal(t, opMeta.GetEntry().GetHash().String(), res.Group.MetadataLatestHead)
	require.Equal(t, int64(2), res.Group.MessageEntriesCount)
	require.Equal(t, int64(1), res.Group.MetadataEntriesCount)
}

func TestReplicationService_Flow(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)

	logger, cleanup := testutil.Logger(t)
	defer cleanup()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pathBase, err := ioutil.TempDir("", "odb_replication_service")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(pathBase)

	baseDS := datastore.Datastore(datastore.NewMapDatastore())
	defer baseDS.Close()

	baseDS = dssync.MutexWrap(baseDS)
	defer baseDS.Close()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()
	ipfsOpts1 := &ipfsutil.TestingAPIOpts{
		Logger:          logger,
		Mocknet:         mn,
		DiscoveryServer: msrv,
		Datastore:       datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer1")),
	}

	ipfsOpts2 := &ipfsutil.TestingAPIOpts{
		Logger:          logger,
		Mocknet:         mn,
		DiscoveryServer: msrv,
		Datastore:       datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer2")),
	}

	api1 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts1)
	odb1 := weshnet.NewTestOrbitDB(ctx, t, logger, api1, ipfsOpts1.Datastore)
	api2 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts2)
	odb2 := weshnet.NewTestOrbitDB(ctx, t, logger, api2, ipfsOpts2.Datastore)

	tokenSecret, tokenPK, _ := bertyauth.HelperGenerateTokenIssuerSecrets(t)
	replPeer := bertyreplication.NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &weshnet.TestingOpts{
		Mocknet:         mn,
		DiscoveryServer: msrv,
	})
	defer cancel()

	err = mn.LinkAll()
	require.NoError(t, err)

	gA, _, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	g1a, err := odb1.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)
	defer g1a.Close()

	g2a, err := odb2.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)
	defer g2a.Close()

	require.NoError(t, g1a.ActivateGroupContext(nil))
	require.NoError(t, g2a.ActivateGroupContext(nil))

	groupReplicable, err := weshnet.FilterGroupForReplication(gA)
	require.NoError(t, err)

	t.Log(" --- Register group on replication service ---")
	{
		ctx = context.WithValue(ctx, authtypes.ContextTokenHashField, "token1")
		ctx = context.WithValue(ctx, authtypes.ContextTokenIssuerField, "issuer1")

		// TODO: handle auth
		_, err = replPeer.Service.ReplicateGroup(ctx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
			Group: groupReplicable,
		})
		require.NoError(t, err)
	}
	// end register group

	t.Log(" --- Sending sync messages ---")
	{
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		m1, m2 := g1a.MetadataStore(), g2a.MetadataStore()

		op1, err := m1.SendAppMetadata(ctx, []byte("From 1 - 1"))
		require.NoError(t, err)

		op2, err := m2.SendAppMetadata(ctx, []byte("From 2 - 1"))
		require.NoError(t, err)

		entries := []cid.Cid{op1.GetEntry().GetHash(), op2.GetEntry().GetHash()}

		err = WaitForEntries(ctx, m1, entries...)
		require.NoError(t, err)

		err = WaitForEntries(ctx, m2, entries...)
		require.NoError(t, err)

		evts1, err := m1.ListEvents(ctx, nil, nil, false)
		require.NoError(t, err)
		ops1 := testutil.TestFilterAppMetadata(t, evts1)
		require.NoError(t, err)
		assert.Equal(t, 2, len(ops1))

		evts2, err := m2.ListEvents(ctx, nil, nil, false)
		require.NoError(t, err)
		ops2 := testutil.TestFilterAppMetadata(t, evts2)
		require.NoError(t, err)
		assert.Equal(t, 2, len(ops2))
	}
	// sending sync message done

	t.Log(" --- Disconnect peer 2 from peer 1 and repl service ---")
	{
		p2 := mn.Host(api2.MockNode().Identity)
		p2.Network().ClosePeer(api1.MockNode().Identity)
		p2.Network().ClosePeer(replPeer.CoreAPI.MockNode().Identity)
	}
	// disconnect peer 2 done

	const messageAmount = 50
	entries := make([]cid.Cid, messageAmount)

	t.Logf(" --- Sending %d async messages ---", messageAmount)
	{
		ctx, cancel := context.WithTimeout(ctx, time.Second*2)
		defer cancel()

		m1 := g1a.MetadataStore()

		for i := 0; i < messageAmount; i++ {
			op, err := m1.SendAppMetadata(ctx, []byte(fmt.Sprintf("From 1 - 2: %d", i)))
			require.NoError(t, err)
			entries[i] = op.GetEntry().GetHash()
		}

		err = WaitForEntries(ctx, m1, entries...)
		require.NoError(t, err)
	}
	// sending async message done

	t.Log(" --- peer 2 connect to replication service and wait for async messages ---")
	{
		ctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()

		// reconnect peer 2 to peer 1
		m2 := g2a.MetadataStore()
		p2 := mn.Host(api2.MockNode().Identity)
		repladdrs := replPeer.CoreAPI.MockNode().Peerstore.PeerInfo(replPeer.CoreAPI.MockNode().Identity)
		err = p2.Connect(ctx, repladdrs)
		require.NoError(t, err)

		err := WaitForEntries(ctx, m2, entries...)
		require.NoError(t, err)
	}
	// peer 2 test done
}

func TestReplicationService_InvalidFlow(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pathBase, err := ioutil.TempDir("", "odb_replication_service")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(pathBase)

	baseDS := datastore.Datastore(datastore.NewMapDatastore())
	defer baseDS.Close()

	baseDS = dssync.MutexWrap(baseDS)
	defer baseDS.Close()

	mn := mocknet.New()
	defer mn.Close()

	msrv := tinder.NewMockDriverServer()

	tokenSecret, tokenPK, _ := bertyauth.HelperGenerateTokenIssuerSecrets(t)
	replPeer := bertyreplication.NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &weshnet.TestingOpts{
		Mocknet:         mn,
		DiscoveryServer: msrv,
	})
	defer cancel()

	gA, _, err := weshnet.NewGroupMultiMember()
	require.NoError(t, err)

	groupReplicable, err := weshnet.FilterGroupForReplication(gA)
	require.NoError(t, err)

	groupReplicable.LinkKey = []byte("nope this is invalid")

	t.Log(" --- Register group on replication service ---")

	ctx = context.WithValue(ctx, authtypes.ContextTokenHashField, "token1")
	ctx = context.WithValue(ctx, authtypes.ContextTokenIssuerField, "issuer1")

	// Changing update key, making the group impossible to track

	_, err = replPeer.Service.ReplicateGroup(ctx, &replicationtypes.ReplicationServiceReplicateGroup_Request{
		Group: groupReplicable,
	})
	require.Error(t, err)
}

func WaitForEntries(ctx context.Context, store iface.Store, hashs ...cid.Cid) error {
	sub, err := store.EventBus().Subscribe(new(stores.EventReplicated))
	if err != nil {
		return fmt.Errorf("unable to subscribe to store: %w", err)
	}
	defer sub.Close()

	missing := map[cid.Cid]struct{}{}
	for _, hash := range hashs {
		if _, found := store.OpLog().Get(hash); found {
			continue
		}

		missing[hash] = struct{}{}
	}

	for len(missing) > 0 {
		select {
		case e := <-sub.Out():
			evt := e.(stores.EventReplicated)
			for _, entry := range evt.Entries {
				delete(missing, entry.GetHash())
			}

		case <-ctx.Done():
			return fmt.Errorf("%w (missing %d elements)", ctx.Err(), len(missing))
		}
	}

	return nil
}
