package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/peer"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/api/trace"
	grpc_trace "go.opentelemetry.io/otel/instrumentation/grpctrace"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
)

type TestingProtocol struct {
	Opts *Opts

	Service Service
	Client  Client
	IPFS    ipfsutil.CoreAPIMock
}

type TestingOpts struct {
	Logger         *zap.Logger
	TracerProvider trace.Provider
	Mocknet        libp2p_mocknet.Mocknet
	RDVPeer        peer.AddrInfo
}

func NewTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts, ds datastore.Batching) (*TestingProtocol, func()) {
	t.Helper()

	if opts == nil {
		opts = &TestingOpts{}
	}
	opts.applyDefaults(ctx)

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	ipfsopts := &ipfsutil.TestingAPIOpts{
		Logger:  opts.Logger,
		Mocknet: opts.Mocknet,
		RDVPeer: opts.RDVPeer,
	}

	node, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsopts)
	deviceKeystore := NewDeviceKeystore(ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(ds, datastore.NewKey(NamespaceDeviceKeystore))))

	odb, err := NewBertyOrbitDB(ctx, node.API(), &NewOrbitDBOptions{
		NewOrbitDBOptions: orbitdb.NewOrbitDBOptions{
			PubSub:               pubsubraw.NewPubSub(node.PubSub(), node.MockNode().PeerHost.ID(), opts.Logger, nil),
			DirectChannelFactory: directchannel.InitDirectChannelFactory(node.MockNode().PeerHost),
		},
		Datastore:      ds,
		DeviceKeystore: deviceKeystore,
	})
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
	}

	service, cleanupService := TestingService(ctx, t, serviceOpts)

	if opts.TracerProvider == nil {
		servicename := node.MockNode().Identity.ShortString()
		opts.TracerProvider = tracer.NewTestingProvider(t, servicename)
	}

	// setup client
	trClient := opts.TracerProvider.Tracer("grpc-client")
	trServer := opts.TracerProvider.Tracer("grpc-server")
	grpcLogger := opts.Logger.Named("grpc")
	zapOpts := []grpc_zap.Option{}

	serverOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
			grpc_trace.UnaryServerInterceptor(trServer),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
			grpc_trace.StreamServerInterceptor(trServer),
		),
	}

	clientOpts := []grpc.DialOption{
		grpc.WithChainUnaryInterceptor(grpc_trace.UnaryClientInterceptor(trClient)),
		grpc.WithChainStreamInterceptor(grpc_trace.StreamClientInterceptor(trClient)),
	}

	server := grpc.NewServer(serverOpts...)
	client, cleanupClient := TestingClientFromServer(ctx, t, server, service, clientOpts...)

	tp := &TestingProtocol{
		Opts:    &serviceOpts,
		Client:  client,
		Service: service,
		IPFS:    node,
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
}

func NewTestingProtocolWithMockedPeers(ctx context.Context, t *testing.T, opts *TestingOpts, ds datastore.Batching, amount int) ([]*TestingProtocol, func()) {
	t.Helper()
	opts.applyDefaults(ctx)
	logger := opts.Logger

	if ds == nil {
		ds = ds_sync.MutexWrap(datastore.NewMapDatastore())
	}

	rdvpeer, err := opts.Mocknet.GenPeer()
	require.NoError(t, err)
	require.NotNil(t, rdvpeer)

	_, cleanupRDVP := ipfsutil.TestingRDVP(ctx, t, rdvpeer)
	rdvpnet := opts.Mocknet.Net(rdvpeer.ID())
	require.NotNil(t, rdvpnet)

	opts.RDVPeer = rdvpeer.Peerstore().PeerInfo(rdvpeer.ID())

	cls := make([]func(), amount)
	tps := make([]*TestingProtocol, amount)
	for i := range tps {
		svcName := fmt.Sprintf("mock%d", i)
		opts.Logger = logger.Named(svcName)
		opts.TracerProvider = tracer.NewTestingProvider(t, svcName)
		ds := ipfsutil.NewNamespacedDatastore(ds, datastore.NewKey(fmt.Sprintf("%d", i)))

		tps[i], cls[i] = NewTestingProtocol(ctx, t, opts, ds)
	}

	err = opts.Mocknet.LinkAll()
	require.NoError(t, err)

	for _, net := range opts.Mocknet.Nets() {
		if net != rdvpnet {
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
		rdvpeer.Close()
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
type ConnnectTestingProtocolFunc func(*testing.T, libp2p_mocknet.Mocknet)

// ConnectAll peers between themselves
func ConnectAll(t *testing.T, m libp2p_mocknet.Mocknet) {
	t.Helper()

	err := m.ConnectAllButSelf()
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
		m.ConnectPeers(peers[i], peers[i+1])
	}
}
