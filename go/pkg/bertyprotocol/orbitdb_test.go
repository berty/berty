package bertyprotocol

import (
	"context"
	"encoding/hex"
	"io/ioutil"
	"strings"
	"testing"
	"time"

	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestDifferentStores(t *testing.T) {
	testutil.FilterSpeed(t, testutil.Slow)
	logger, cleanup := testutil.Logger(t)
	defer cleanup()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mn := mocknet.New()
	defer mn.Close()

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

	baseDS, err := accountutils.GetRootDatastoreForPath(pathBase, nil, nil, zap.NewNop())
	require.NoError(t, err)

	baseDS = sync_ds.MutexWrap(baseDS)

	defer testutil.Close(t, baseDS)

	api1, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts)
	defer cleanup()

	odb1 := NewTestOrbitDB(ctx, t, logger, api1, datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer1")))
	defer testutil.Close(t, odb1)

	api2, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsOpts)
	defer cleanup()

	odb2 := NewTestOrbitDB(ctx, t, logger, api2, datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey("peer2")))
	defer testutil.Close(t, odb2)

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
	defer g1a.Close()

	g2a, err := odb2.OpenGroup(ctx, gA, nil)
	require.NoError(t, err)
	defer g2a.Close()

	g1b, err := odb1.OpenGroup(ctx, gB, nil)
	require.NoError(t, err)
	defer g1b.Close()

	g2b, err := odb2.OpenGroup(ctx, gB, nil)
	require.NoError(t, err)
	defer g2b.Close()

	require.NoError(t, g1a.ActivateGroupContext(nil))
	require.NoError(t, g2a.ActivateGroupContext(nil))
	require.NoError(t, g1b.ActivateGroupContext(nil))
	require.NoError(t, g2b.ActivateGroupContext(nil))

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

	{
		var err error
		var cc <-chan *protocoltypes.GroupMetadataEvent
		var ops []*protocoltypes.AppMetadata

		assert.Eventually(t, func() bool {
			cc, err = g1a.MetadataStore().ListEvents(ctx, nil, nil, false)
			ops = testutil.TestFilterAppMetadata(t, cc)
			return len(ops) == 2
		}, time.Second*2, time.Millisecond*100, "have: %d, want: %d", len(ops), 2)
		require.NoError(t, err)

		assert.Eventually(t, func() bool {
			cc, err = g2a.MetadataStore().ListEvents(ctx, nil, nil, false)
			ops = testutil.TestFilterAppMetadata(t, cc)
			return len(ops) == 2
		}, time.Second*2, time.Millisecond*100, "have: %d, want: %d", len(ops), 2)
		require.NoError(t, err)

		assert.Eventually(t, func() bool {
			cc, err = g1b.MetadataStore().ListEvents(ctx, nil, nil, false)
			ops = testutil.TestFilterAppMetadata(t, cc)
			return len(ops) == 4
		}, time.Second*2, time.Millisecond*100, "have: %d, want: %d", len(ops), 5)
		require.NoError(t, err)

		assert.Eventually(t, func() bool {
			cc, err = g2b.MetadataStore().ListEvents(ctx, nil, nil, false)
			ops = testutil.TestFilterAppMetadata(t, cc)
			return len(ops) == 4
		}, time.Second*2, time.Millisecond*100, "have: %d, want: %d", len(ops), 4)
		require.NoError(t, err)
	}
}
