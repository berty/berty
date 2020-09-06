package bertyprotocol

import (
	"context"
	"encoding/hex"
	"io/ioutil"
	"strings"
	"testing"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

func newTestOrbitDB(ctx context.Context, t *testing.T, logger *zap.Logger, node ipfsutil.CoreAPIMock, baseDS datastore.Batching) *bertyOrbitDB {
	t.Helper()

	api := node.API()
	selfKey, err := api.Key().Self(ctx)
	if err != nil {
		t.Fatal(err)
	}

	baseDS = ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey(selfKey.ID().String()))

	accountDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("deviceKeystore"))
	messagesDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("messages"))
	orbitdbDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("orbitdb"))

	accountKS := ipfsutil.NewDatastoreKeystore(accountDS)
	orbitdbCache := NewOrbitDatastoreCache(orbitdbDS)
	mk := NewMessageKeystore(messagesDS)

	odb, err := newBertyOrbitDB(ctx, api, NewDeviceKeystore(accountKS), mk, &orbitdb.NewOrbitDBOptions{
		Logger:               logger,
		PubSub:               pubsubraw.NewPubSub(node.PubSub(), selfKey.ID(), logger, nil),
		DirectChannelFactory: directchannel.InitDirectChannelFactory(node.MockNode().PeerHost),
		Cache:                orbitdbCache,
	})
	require.NoError(t, err)

	return odb
}

func TestDifferentStores(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	defer rdvp.Close()

	_, cleanrdvp := ipfsutil.TestingRDVP(ctx, t, rdvp)
	defer cleanrdvp()

	ipfsOpts := &ipfsutil.TestingAPIOpts{
		Logger:  logger,
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	}

	pathBase, err := ioutil.TempDir("", "odb_manyaddstest")
	if err != nil {
		t.Fatal(err)
	}

	require.NoError(t, mn.ConnectAllButSelf())

	var baseDS datastore.Batching
	baseDS, err = badger.NewDatastore(pathBase, nil)
	require.NoError(t, err)

	defer baseDS.Close()

	baseDS = sync_ds.MutexWrap(baseDS)

	defer baseDS.Close()

	api1, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts)
	defer cleanup()

	odb1 := newTestOrbitDB(ctx, t, logger, api1, baseDS)
	defer odb1.Close()

	api2, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts)
	defer cleanup()

	odb2 := newTestOrbitDB(ctx, t, logger, api2, baseDS)
	defer odb2.Close()

	err = mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)

	gA, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	gB, _, err := NewGroupMultiMember()
	require.NoError(t, err)

	assert.NotEqual(t, gA.PublicKey, gB.PublicKey)

	g1a, err := odb1.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)

	g2a, err := odb2.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)

	g1b, err := odb1.OpenGroup(ctx, gB, nil)
	require.NoError(t, err)

	g2b, err := odb2.OpenGroup(ctx, gB, nil)
	require.NoError(t, err)

	require.NoError(t, ActivateGroupContext(ctx, g1a))
	require.NoError(t, ActivateGroupContext(ctx, g2a))
	require.NoError(t, ActivateGroupContext(ctx, g1b))
	require.NoError(t, ActivateGroupContext(ctx, g2b))

	assert.Equal(t, g1a.MetadataStore().Address().String(), g2a.MetadataStore().Address().String())
	assert.Equal(t, g1b.MetadataStore().Address().String(), g2b.MetadataStore().Address().String())
	assert.NotEqual(t, g1a.MetadataStore().Address().String(), g1a.MessageStore().Address().String())
	assert.NotEqual(t, g1a.MetadataStore().Address().String(), g1b.MetadataStore().Address().String())

	authorized1, err := g1a.MetadataStore().AccessController().GetAuthorizedByRole("write")
	require.NoError(t, err)

	authorized2, err := g1a.MetadataStore().AccessController().GetAuthorizedByRole("write")
	require.NoError(t, err)

	assert.Equal(t, strings.Join(authorized1, ","), strings.Join(authorized2, ","))

	pk1, err := g1a.MetadataStore().Identity().GetPublicKey()
	require.NoError(t, err)

	pk2, err := g2a.MetadataStore().Identity().GetPublicKey()
	require.NoError(t, err)

	require.True(t, pk1.Equals(pk2))

	rawPK, err := pk1.Raw()
	require.NoError(t, err)

	require.Equal(t, hex.EncodeToString(rawPK), authorized1[0])

	_, err = g1a.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 1"))
	require.NoError(t, err)

	_, err = g2a.MetadataStore().SendAppMetadata(ctx, []byte("From 2 - 1"))
	require.NoError(t, err)

	_, err = g1b.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 2"))
	require.NoError(t, err)

	_, err = g2b.MetadataStore().SendAppMetadata(ctx, []byte("From 2 - 2"))
	require.NoError(t, err)

	_, err = g1b.MetadataStore().SendAppMetadata(ctx, []byte("From 1 - 3"))
	require.NoError(t, err)

	_, err = g2b.MetadataStore().SendAppMetadata(ctx, []byte("From 2 - 3"))
	require.NoError(t, err)

	time.Sleep(time.Millisecond * 250)

	ops1 := testFilterAppMetadata(t, g1a.MetadataStore().ListEvents(ctx))
	require.NoError(t, err)

	ops2 := testFilterAppMetadata(t, g2a.MetadataStore().ListEvents(ctx))
	require.NoError(t, err)

	ops3 := testFilterAppMetadata(t, g1b.MetadataStore().ListEvents(ctx))
	require.NoError(t, err)

	ops4 := testFilterAppMetadata(t, g2b.MetadataStore().ListEvents(ctx))
	require.NoError(t, err)

	assert.Equal(t, 2, len(ops1))
	assert.Equal(t, 2, len(ops2))
	assert.Equal(t, 4, len(ops3))
	assert.Equal(t, 4, len(ops4))
}

func testFilterAppMetadata(t *testing.T, events <-chan *bertytypes.GroupMetadataEvent) []*bertytypes.AppMetadata {
	t.Helper()

	out := []*bertytypes.AppMetadata(nil)

	for evt := range events {
		if evt == nil {
			continue
		}

		if evt.Metadata.EventType != bertytypes.EventTypeGroupMetadataPayloadSent {
			continue
		}

		m := &bertytypes.AppMetadata{}
		if err := m.Unmarshal(evt.Event); err != nil {
			continue
		}

		out = append(out, m)
	}

	return out
}
