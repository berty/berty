package bertyreplication_test

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/event"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyauth"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertyreplication"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/replicationtypes"
	orbitdb "berty.tech/go-orbit-db"
)

func TestNewReplicationService(t *testing.T) {
	ctx, cancel, mn, rdvp := bertyprotocol.TestHelperIPFSSetUp(t)
	defer cancel()

	ds := dssync.MutexWrap(datastore.NewMapDatastore())
	api, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})
	defer cleanup()

	orbitdbCache := bertyprotocol.NewOrbitDatastoreCache(ds)

	odb, err := bertyprotocol.NewBertyOrbitDB(ctx, api.API(), &bertyprotocol.NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: zap.NewNop(),
			Cache:  orbitdbCache,
		},
	})
	require.NoError(t, err)

	db, cleanup := bertyreplication.DBForTests(t, nil)
	defer cleanup()

	repl, err := bertyreplication.NewReplicationService(ctx, db, odb, zap.NewNop())
	require.NoError(t, err)
	require.NotNil(t, repl)
}

func TestReplicationService_GroupSubscribe(t *testing.T) {
	ctx, cancel, mn, rdvp := bertyprotocol.TestHelperIPFSSetUp(t)
	defer cancel()

	db, cleanup := bertyreplication.DBForTests(t, zap.NewNop())
	defer cleanup()

	repl, cancel := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), nil, db)
	defer cancel()

	g, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := bertyprotocol.FilterGroupForReplication(g)
	require.NoError(t, err)

	err = repl.GroupSubscribe(replGroup, messengerutil.B64EncodeBytes(replGroup.PublicKey))
	require.NoError(t, err)

	err = repl.GroupSubscribe(&protocoltypes.Group{
		PublicKey: nil,
	}, "")
	require.Error(t, err)
}

func TestReplicationService_GroupRegister(t *testing.T) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	ctx, cancel, mn, rdvp := bertyprotocol.TestHelperIPFSSetUp(t)
	defer cancel()

	db, cleanup := bertyreplication.DBForTests(t, zap.NewNop())
	defer cleanup()

	repl, cancel := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), ds, db)
	defer cancel()

	g, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := bertyprotocol.FilterGroupForReplication(g)
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
	repl, cancel = bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), ds, db)
	defer cancel()

	ok := repl.OrbitDB().IsGroupLoaded(g.GroupIDAsString())
	require.True(t, ok)
}

func TestReplicationService_ReplicateGroupStats_ReplicateGlobalStats(t *testing.T) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	ctx, cancel, mn, rdvp := bertyprotocol.TestHelperIPFSSetUp(t)
	defer cancel()

	peer1DS := dssync.MutexWrap(datastore.NewMapDatastore())

	ipfsOpts1 := &ipfsutil.TestingAPIOpts{
		Logger:    zap.NewNop(),
		Mocknet:   mn,
		RDVPeer:   rdvp.Peerstore().PeerInfo(rdvp.ID()),
		Datastore: datastoreutil.NewNamespacedDatastore(peer1DS, datastore.NewKey("peer1")),
	}

	api1, cleanupAPI1 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts1)
	odb1 := bertyprotocol.NewTestOrbitDB(ctx, t, zap.NewNop(), api1, ipfsOpts1.Datastore)
	defer cleanupAPI1()

	db, cleanup := bertyreplication.DBForTests(t, zap.NewNop())
	defer cleanup()

	repl, cancel := bertyreplication.TestHelperNewReplicationService(ctx, t, nil, mn, rdvp.Peerstore().PeerInfo(rdvp.ID()), ds, db)
	defer cancel()

	require.NoError(t, mn.LinkAll())
	require.NoError(t, mn.ConnectAllButSelf())

	globalStats, err := repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
	require.NoError(t, err)

	require.Equal(t, int64(0), globalStats.ReplicatedGroups)
	require.NotEqual(t, int64(0), globalStats.StartedAt)
	require.Equal(t, int64(0), globalStats.TotalMetadataEntries)
	require.Equal(t, int64(0), globalStats.TotalMessageEntries)

	startedAt := globalStats.StartedAt

	g, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	replGroup, err := bertyprotocol.FilterGroupForReplication(g)
	require.NoError(t, err)

	err = repl.GroupRegister("token", "issuer", replGroup)
	require.NoError(t, err)

	globalStats, err = repl.ReplicateGlobalStats(ctx, &replicationtypes.ReplicateGlobalStats_Request{})
	require.NoError(t, err)

	require.Equal(t, int64(1), globalStats.ReplicatedGroups)
	require.Equal(t, startedAt, globalStats.StartedAt)
	require.Equal(t, int64(0), globalStats.TotalMetadataEntries)
	require.Equal(t, int64(0), globalStats.TotalMessageEntries)

	res, err := repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{})
	require.Error(t, err)

	res, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes([]byte("invalid_pk")),
	})
	require.Error(t, err)

	res, err = repl.ReplicateGroupStats(ctx, &replicationtypes.ReplicateGroupStats_Request{
		GroupPublicKey: messengerutil.B64EncodeBytes(replGroup.PublicKey),
	})
	require.NoError(t, err)

	t.Log(fmt.Sprintf("%+v", res.GetGroup()))

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

	opMeta, err := gcPeer1.MetadataStore().SendAppMetadata(ctx, []byte("meta_1"), nil)
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

	t.Log(fmt.Sprintf("%+v", res.GetGroup()))

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

	opMsg, err := gcPeer1.MessageStore().AddMessage(ctx, []byte("hey"), nil)
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

	t.Log(fmt.Sprintf("%+v", res.GetGroup()))

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

	opMsg2, err := gcPeer1.MessageStore().AddMessage(ctx, []byte("hey 2"), nil)
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

	t.Log(fmt.Sprintf("%+v", res.GetGroup()))

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
	odb1 := bertyprotocol.NewTestOrbitDB(ctx, t, logger, api1, ipfsOpts1.Datastore)
	api2, cleanupAPI2 := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts2)
	odb2 := bertyprotocol.NewTestOrbitDB(ctx, t, logger, api2, ipfsOpts2.Datastore)

	tokenSecret, tokenPK, _ := bertyauth.HelperGenerateTokenIssuerSecrets(t)
	replPeer, cancel := bertyreplication.NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})
	defer cancel()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	gA, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	g1a, err := odb1.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)

	g2a, err := odb2.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)

	require.NoError(t, bertyprotocol.ActivateGroupContext(ctx, g1a, nil))
	require.NoError(t, bertyprotocol.ActivateGroupContext(ctx, g2a, nil))

	groupReplicable, err := bertyprotocol.FilterGroupForReplication(gA)
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
	t.Log(" --- Registered group on replication service ---")

	t.Log(" --- Sending sync messages ---")
	{
		sub1a, err := g1a.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
		require.NoError(t, err)

		sub2a, err := g2a.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
		require.NoError(t, err)

		_, err = g1a.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 1"), nil)
		require.NoError(t, err)

		_, err = g2a.MetadataStore().SendAppMetadata(ctx, []byte("From 2 - 1"), nil)
		require.NoError(t, err)

		var evt interface{}
		subs := []event.Subscription{sub1a, sub2a}
		for _, sub := range subs {
			for i := 0; i < 2; {
				select {
				case <-time.After(time.Second * 2):
					require.FailNow(t, "timeout while waiting for message")
				case evt = <-sub.Out():
				}

				if evt.(protocoltypes.GroupMetadataEvent).Metadata.EventType == protocoltypes.EventTypeGroupMetadataPayloadSent {
					i++
				}
			}
			sub.Close()
		}

		// wait for event to be fully replicated
		// @FIXME(gfanton) this should not happen, edit metadatastore to emit when
		// event has been replicated only ?
		time.Sleep(time.Second)

		evts1, err := g1a.MetadataStore().ListEvents(ctx, nil, nil, false)
		require.NoError(t, err)
		ops1 := testutil.TestFilterAppMetadata(t, evts1)
		require.NoError(t, err)

		evts2, err := g2a.MetadataStore().ListEvents(ctx, nil, nil, false)
		require.NoError(t, err)
		ops2 := testutil.TestFilterAppMetadata(t, evts2)
		require.NoError(t, err)

		assert.Equal(t, 2, len(ops1))
		assert.Equal(t, 2, len(ops2))

		odb2.Close()
		cleanupAPI2()

	}
	t.Log(" --- Sent sync messages ---")
	t.Log(" --- Closed peer 2 ---")

	const messageAmount = 50

	t.Log(" --- Sending async messages ---")
	{

		sub2a, err := g1a.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
		require.NoError(t, err)

		cerr := make(chan error)
		go func() {
			var evt interface{}
			defer close(cerr)
			defer sub2a.Close()

			for i := 0; i < messageAmount; {
				select {
				case <-time.After(time.Second * 5):
					cerr <- fmt.Errorf("timeout while waiting for event")
					return
				case evt = <-sub2a.Out():
				}

				if evt.(protocoltypes.GroupMetadataEvent).Metadata.EventType == protocoltypes.EventTypeGroupMetadataPayloadSent {
					i++
				}
			}
		}()

		for i := 0; i < messageAmount; i++ {
			_, err = g1a.MetadataStore().SendAppMetadata(ctx, []byte(fmt.Sprintf("From 1 - 2: %d", i)), nil)
			require.NoError(t, err)
		}

		err = <-cerr
		require.NoError(t, err)

		odb1.Close()
		cleanupAPI1()
	}
	t.Log(" --- Sent async messages, should be replicated on service ---")
	t.Log(" --- Closed peer 1 ---")

	t.Log(" --- Opening peer 2, and its db ---")
	{
		api2, cleanupAPI2 = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts2)
		defer cleanupAPI2()

		odb2 = bertyprotocol.NewTestOrbitDB(ctx, t, logger, api2, ipfsOpts2.Datastore)
		defer odb2.Close()

		g2a, err = odb2.OpenGroup(ctx, gA, nil)
		require.NoError(t, err)

		sub2a, err := g2a.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
		require.NoError(t, err)

		cerr := make(chan error)
		go func() {
			var evt interface{}

			defer close(cerr)
			defer sub2a.Close()

			for i := 0; i < messageAmount; {
				select {
				case <-time.After(time.Second * 5):
					cerr <- fmt.Errorf("timeout while waiting for event")
					return
				case evt = <-sub2a.Out():
				}

				if evt.(protocoltypes.GroupMetadataEvent).Metadata.EventType == protocoltypes.EventTypeGroupMetadataPayloadSent {
					i++
				}
			}
		}()

		err = mn.LinkAll()
		require.NoError(t, err)

		err = mn.ConnectAllButSelf()
		require.NoError(t, err)

		err = <-cerr
		require.NoError(t, err)

		t.Log(" --- Waited for peer 2 to replicate data ---")

		evts2, err := g2a.MetadataStore().ListEvents(ctx, nil, nil, false)
		require.NoError(t, err)
		ops2 := testutil.TestFilterAppMetadata(t, evts2)
		require.NoError(t, err)
		assert.Equal(t, messageAmount+2, len(ops2)) // ammount of message + 2 sync
	}
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

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	defer rdvp.Close()

	_, cleanrdvp := ipfsutil.TestingRDVP(ctx, t, rdvp)
	defer cleanrdvp()

	tokenSecret, tokenPK, _ := bertyauth.HelperGenerateTokenIssuerSecrets(t)
	replPeer, cancel := bertyreplication.NewReplicationMockedPeer(ctx, t, tokenSecret, tokenPK, &bertyprotocol.TestingOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})
	defer cancel()

	gA, _, err := bertyprotocol.NewGroupMultiMember()
	require.NoError(t, err)

	groupReplicable, err := bertyprotocol.FilterGroupForReplication(gA)
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
