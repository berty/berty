package bertyprotocol

import (
	"context"
	"crypto/ed25519"
	crand "crypto/rand"
	"fmt"
	"net"
	"testing"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/peer"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/box"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
)

type TestingProtocol struct {
	Opts *Opts

	Service Service
	Client  Client
}

type TestingReplicationPeer struct {
	Service ReplicationService
}

type TestingOpts struct {
	Logger         *zap.Logger
	Mocknet        libp2p_mocknet.Mocknet
	RDVPeer        peer.AddrInfo
	DeviceKeystore DeviceKeystore
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
		deviceKeystore = NewDeviceKeystore(ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(ds, datastore.NewKey(NamespaceDeviceKeystore))))
	}

	odb := opts.OrbitDB
	if odb == nil {
		var err error

		odb, err = NewBertyOrbitDB(ctx, node.API(), &NewOrbitDBOptions{
			NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
				PubSub: pubsubraw.NewPubSub(node.PubSub(), node.MockNode().PeerHost.ID(), opts.Logger, nil),
				Logger: opts.Logger,
			},
			Datastore:      ds,
			DeviceKeystore: deviceKeystore,
		})
		require.NoError(t, err)
	}

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

func testHelperNewReplicationService(ctx context.Context, t *testing.T, logger *zap.Logger, mn libp2p_mocknet.Mocknet, rdvp peer.AddrInfo, ds datastore.Batching) (*replicationService, context.CancelFunc) {
	t.Helper()

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	api, cleanup := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, &ipfsutil.TestingAPIOpts{
		Logger:    logger,
		Mocknet:   mn,
		RDVPeer:   rdvp,
		Datastore: ds,
	})
	odb, err := NewBertyOrbitDB(ctx, api.API(), &NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			Logger: logger,
			Cache:  NewOrbitDatastoreCache(ds),
		},
	})
	require.NoError(t, err)

	repl, err := NewReplicationService(ctx, ds, odb, logger)
	require.NoError(t, err)
	require.NotNil(t, repl)

	svc, ok := repl.(*replicationService)
	require.True(t, ok)

	return svc, cleanup
}

func NewReplicationMockedPeer(ctx context.Context, t *testing.T, secret []byte, sk ed25519.PublicKey, opts *TestingOpts) (*TestingReplicationPeer, func()) {
	// TODO: handle auth
	_ = secret
	_ = sk

	replServ, cleanupReplMan := testHelperNewReplicationService(ctx, t, nil, opts.Mocknet, opts.RDVPeer, nil)

	return &TestingReplicationPeer{
			Service: replServ,
		}, func() {
			cleanupReplMan()
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
		ds := ipfsutil.NewNamespacedDatastore(ds, datastore.NewKey(fmt.Sprintf("%d", i)))

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

func PushServerForTests(ctx context.Context, t testing.TB, dispatchers []PushDispatcher, logger *zap.Logger) (PushService, *[32]byte, string, context.CancelFunc) {
	secret := make([]byte, cryptoutil.KeySize)
	_, err := crand.Read(secret)
	require.NoError(t, err)

	pushPK, pushSK, err := box.GenerateKey(crand.Reader)
	require.NoError(t, err)

	pushService, err := NewPushService(pushSK, dispatchers, logger)
	require.NoError(t, err)

	ctx, cancel := context.WithCancel(ctx)
	server := grpc.NewServer()

	mux := grpcgw.NewServeMux()

	RegisterPushServiceServer(server, pushService)
	err = RegisterPushServiceHandlerServer(ctx, mux, pushService)
	require.NoError(t, err)

	l, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)

	go func() {
		err := server.Serve(l)
		if err != nil {
			cancel()
		}
	}()

	return pushService, pushPK, l.Addr().String(), cancel
}
