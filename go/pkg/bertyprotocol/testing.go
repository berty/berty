package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
)

func TestHelperIPFSSetUp(t *testing.T) (context.Context, context.CancelFunc, libp2p_mocknet.Mocknet, host.Host) {
	t.Helper()

	ctx, cancel := context.WithCancel(context.Background())

	mn := libp2p_mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	return ctx, cancel, mn, rdvp
}

func NewTestOrbitDB(ctx context.Context, t *testing.T, logger *zap.Logger, node ipfsutil.CoreAPIMock, baseDS datastore.Batching) *BertyOrbitDB {
	t.Helper()

	api := node.API()
	selfKey, err := api.Key().Self(ctx)
	if err != nil {
		t.Fatal(err)
	}

	baseDS = datastoreutil.NewNamespacedDatastore(baseDS, datastore.NewKey(selfKey.ID().String()))

	pubSub := pubsubraw.NewPubSub(node.PubSub(), selfKey.ID(), logger, nil)

	odb, err := NewBertyOrbitDB(ctx, api, &NewOrbitDBOptions{
		Datastore: baseDS,
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: logger,
			PubSub: pubSub,
		},
	})
	require.NoError(t, err)

	return odb
}

type mockedPeer struct {
	CoreAPI ipfsutil.CoreAPIMock
	DB      *BertyOrbitDB
	GC      *GroupContext
	MKS     *cryptoutil.MessageKeystore
	DevKS   cryptoutil.DeviceKeystore
}

func (m *mockedPeer) PeerInfo() peer.AddrInfo {
	return m.CoreAPI.MockNode().Peerstore.PeerInfo(m.CoreAPI.MockNode().Identity)
}

type TestingProtocol struct {
	Opts *Opts

	Service Service
	Client  Client

	RootDatastore  datastore.Batching
	DeviceKeystore cryptoutil.DeviceKeystore
	IpfsCoreAPI    ipfsutil.ExtendedCoreAPI
	OrbitDB        *BertyOrbitDB
	GroupDatastore *cryptoutil.GroupDatastore
}

type TestingOpts struct {
	Logger         *zap.Logger
	Mocknet        libp2p_mocknet.Mocknet
	RDVPeer        peer.AddrInfo
	DeviceKeystore cryptoutil.DeviceKeystore
	CoreAPIMock    ipfsutil.CoreAPIMock
	OrbitDB        *BertyOrbitDB
	ConnectFunc    ConnectTestingProtocolFunc
	PushSK         *[32]byte
}

func NewTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts, ds datastore.Batching) (*TestingProtocol, func()) {
	if opts == nil {
		opts = &TestingOpts{}
	}
	opts.applyDefaults(ctx)

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	ipfsopts := &ipfsutil.TestingAPIOpts{
		Logger:    opts.Logger,
		Mocknet:   opts.Mocknet,
		RDVPeer:   opts.RDVPeer,
		Datastore: ds,
	}

	node := opts.CoreAPIMock
	cleanupNode := func() {}
	if node == nil {
		node, cleanupNode = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsopts)
	}

	deviceKeystore := opts.DeviceKeystore
	if deviceKeystore == nil {
		deviceKeystore = cryptoutil.NewDeviceKeystore(ipfsutil.NewDatastoreKeystore(datastoreutil.NewNamespacedDatastore(ds, datastore.NewKey(NamespaceDeviceKeystore))), nil)
	}

	odb := opts.OrbitDB
	if odb == nil {
		var err error

		pubSub := pubsubraw.NewPubSub(node.PubSub(), node.MockNode().PeerHost.ID(), opts.Logger, nil)

		odb, err = NewBertyOrbitDB(ctx, node.API(), &NewOrbitDBOptions{
			NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
				PubSub: pubSub,
				Logger: opts.Logger,
			},
			Datastore:      ds,
			DeviceKeystore: deviceKeystore,
		})
		require.NoError(t, err)
	}

	groupDatastore, err := cryptoutil.NewGroupDatastore(ds)
	require.NoError(t, err)

	serviceOpts := Opts{
		Host:           node.MockNode().PeerHost,
		PubSub:         node.PubSub(),
		Logger:         opts.Logger,
		RootDatastore:  ds,
		DeviceKeystore: deviceKeystore,
		IpfsCoreAPI:    node.API(),
		OrbitDB:        odb,
		TinderDriver:   node.Tinder(),
		PushKey:        opts.PushSK,
		GroupDatastore: groupDatastore,
	}

	service, cleanupService := TestingService(ctx, t, serviceOpts)

	// setup client
	grpcLogger := opts.Logger.Named("grpc")
	zapOpts := []grpc_zap.Option{}

	serverOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
		),
	}

	clientOpts := []grpc.DialOption{
		grpc.WithChainUnaryInterceptor(),
		grpc.WithChainStreamInterceptor(),
	}

	server := grpc.NewServer(serverOpts...)
	client, cleanupClient := TestingClientFromServer(ctx, t, server, service, clientOpts...)

	tp := &TestingProtocol{
		Opts:    &serviceOpts,
		Client:  client,
		Service: service,

		RootDatastore:  ds,
		DeviceKeystore: deviceKeystore,
		IpfsCoreAPI:    node.API(),
		OrbitDB:        odb,
		GroupDatastore: serviceOpts.GroupDatastore,
	}
	cleanup := func() {
		server.Stop()
		cleanupClient()
		cleanupService()
		cleanupNode()
	}
	return tp, cleanup
}

func (opts *TestingOpts) applyDefaults(ctx context.Context) {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	if opts.Mocknet == nil {
		opts.Mocknet = libp2p_mocknet.New(ctx)
	}
	if opts.ConnectFunc == nil {
		opts.ConnectFunc = ConnectAll
	}
}

func NewTestingProtocolWithMockedPeers(ctx context.Context, t *testing.T, opts *TestingOpts, ds datastore.Batching, amount int) ([]*TestingProtocol, func()) {
	t.Helper()
	opts.applyDefaults(ctx)
	logger := opts.Logger

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	cleanupRDVP := func() {}
	closeRDVP := func() error { return nil }

	if opts.RDVPeer.ID == "" {
		rdvpeer, err := opts.Mocknet.GenPeer()
		require.NoError(t, err)
		require.NotNil(t, rdvpeer)

		_, cleanupRDVP = ipfsutil.TestingRDVP(ctx, t, rdvpeer)
		closeRDVP = rdvpeer.Close

		opts.RDVPeer = rdvpeer.Peerstore().PeerInfo(rdvpeer.ID())
	}

	rdvpnet := opts.Mocknet.Net(opts.RDVPeer.ID)
	require.NotNil(t, rdvpnet)

	cls := make([]func(), amount)
	tps := make([]*TestingProtocol, amount)
	for i := range tps {
		svcName := fmt.Sprintf("mock%d", i)
		opts.Logger = logger.Named(svcName)
		ds := datastoreutil.NewNamespacedDatastore(ds, datastore.NewKey(fmt.Sprintf("%d", i)))

		tps[i], cls[i] = NewTestingProtocol(ctx, t, opts, ds)
	}

	opts.ConnectFunc(t, opts.Mocknet)

	for _, net := range opts.Mocknet.Nets() {
		if net != rdvpnet {
			_, err := opts.Mocknet.LinkNets(net, rdvpnet)
			assert.NoError(t, err)

			_, err = opts.Mocknet.ConnectNets(net, rdvpnet)
			assert.NoError(t, err)
		}
	}

	cleanup := func() {
		for i := range cls {
			cls[i]()
		}

		cleanupRDVP()

		rdvpnet.Close()
		closeRDVP()
	}
	return tps, cleanup
}

// TestingService returns a configured Client struct with in-memory contexts.
func TestingService(ctx context.Context, t *testing.T, opts Opts) (Service, func()) {
	t.Helper()

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanupNode := func() {}

	if opts.IpfsCoreAPI == nil {
		var mn ipfsutil.CoreAPIMock
		mn, cleanupNode = ipfsutil.TestingCoreAPI(ctx, t)
		opts.IpfsCoreAPI = mn.API()
	}

	service, err := New(ctx, opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		service.Close()
		cleanupNode()
	}

	return service, cleanup
}

func TestingClientFromServer(ctx context.Context, t *testing.T, s *grpc.Server, svc Service, dialOpts ...grpc.DialOption) (client Client, cleanup func()) {
	t.Helper()

	var err error

	client, err = NewClientFromServer(ctx, s, svc, dialOpts...)
	require.NoError(t, err)
	cleanup = func() {
		client.Close()
	}

	return
}

func TestingClient(ctx context.Context, t *testing.T, svc Service, clientOpts []grpc.DialOption, serverOpts []grpc.ServerOption) (client Client, cleanup func()) {
	t.Helper()

	var err error

	client, err = NewClient(ctx, svc, clientOpts, serverOpts)
	require.NoError(t, err)
	cleanup = func() { client.Close() }

	return
}

// Connect Peers Helper
type ConnectTestingProtocolFunc func(*testing.T, libp2p_mocknet.Mocknet)

// ConnectAll peers between themselves
func ConnectAll(t *testing.T, m libp2p_mocknet.Mocknet) {
	t.Helper()

	err := m.LinkAll()
	require.NoError(t, err)

	err = m.ConnectAllButSelf()
	require.NoError(t, err)
}

// ConnectInLine, connect peers one by one in order to make a straight line:
// ┌───┐    ┌───┐    ┌───┐         ┌───┐
// │ 1 │───▶│ 2 │───▶│ 3 │─ ─ ─ ─ ▶│ x │
// └───┘    └───┘    └───┘         └───┘

func ConnectInLine(t *testing.T, m libp2p_mocknet.Mocknet) {
	t.Helper()

	peers := m.Peers()

	for i := 0; i < len(peers)-1; i++ {
		_, err := m.LinkPeers(peers[i], peers[i+1])
		require.NoError(t, err)

		_, err = m.ConnectPeers(peers[i], peers[i+1])
		require.NoError(t, err)
	}
}

func CreatePeersWithGroupTest(ctx context.Context, t testing.TB, pathBase string, memberCount int, deviceCount int) ([]*mockedPeer, crypto.PrivKey, func()) {
	t.Helper()

	var devKS cryptoutil.DeviceKeystore

	mockedPeers := make([]*mockedPeer, memberCount*deviceCount)

	g, groupSK, err := NewGroupMultiMember()
	if err != nil {
		t.Fatal(err)
	}

	mn := libp2p_mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	require.NoError(t, err, "failed to generate mocked peer")

	_, cleanuprdvp := ipfsutil.TestingRDVP(ctx, t, rdvp)

	ipfsopts := ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	}
	deviceIndex := 0

	cls := make([]func(), memberCount)
	for i := 0; i < memberCount; i++ {
		for j := 0; j < deviceCount; j++ {
			ca, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsopts)

			if j == 0 {
				devKS = cryptoutil.NewDeviceKeystore(keystore.NewMemKeystore(), nil)
			} else {
				accSK, err := devKS.AccountPrivKey()
				require.NoError(t, err, "deviceKeystore private key")

				accProofSK, err := devKS.AccountProofPrivKey()
				require.NoError(t, err, "deviceKeystore private proof key")

				devKS, err = cryptoutil.NewWithExistingKeys(keystore.NewMemKeystore(), accSK, accProofSK)
				require.NoError(t, err, "deviceKeystore from existing keys")
			}

			mk, cleanupMessageKeystore := cryptoutil.NewInMemMessageKeystore()

			db, err := NewBertyOrbitDB(ctx, ca.API(), &NewOrbitDBOptions{
				DeviceKeystore:  devKS,
				MessageKeystore: mk,
			})
			if err != nil {
				t.Fatal(err)
			}

			gc, err := db.OpenGroup(ctx, g, nil)
			if err != nil {
				t.Fatalf("err: creating new group context, %v", err)
			}

			mp := &mockedPeer{
				CoreAPI: ca,
				DB:      db,
				GC:      gc,
				MKS:     mk,
				DevKS:   devKS,
			}

			// setup cleanup
			cls[i] = func() {
				if ms := mp.GC.MetadataStore(); ms != nil {
					err := ms.Drop()
					assert.NoError(t, err)
				}

				if db := mp.DB; db != nil {
					err := db.Close()
					assert.NoError(t, err)
				}

				cleanupNode()
				cleanupMessageKeystore()
			}

			mockedPeers[deviceIndex] = mp
			deviceIndex++
		}
	}

	connectPeers(ctx, t, ipfsopts.Mocknet)

	return mockedPeers, groupSK, func() {
		for _, cleanup := range cls {
			cleanup()
		}

		cleanuprdvp()

		_ = rdvp.Close()
	}
}

func connectPeers(ctx context.Context, t testing.TB, mn libp2p_mocknet.Mocknet) {
	t.Helper()

	err := mn.LinkAll()
	require.NoError(t, err)

	err = mn.ConnectAllButSelf()
	require.NoError(t, err)
}

func dropPeers(t *testing.T, mockedPeers []*mockedPeer) {
	t.Helper()

	for _, m := range mockedPeers {
		if ms := m.GC.MetadataStore(); ms != nil {
			if err := ms.Drop(); err != nil {
				t.Fatal(err)
			}
		}

		if db := m.DB; db != nil {
			if err := db.Close(); err != nil {
				t.Fatal(err)
			}
		}

		if ca := m.CoreAPI; ca != nil {
			if err := ca.MockNode().Close(); err != nil {
				t.Fatal(err)
			}
		}
	}
}
