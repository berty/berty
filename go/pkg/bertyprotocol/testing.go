package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpc_trace "go.opentelemetry.io/otel/plugin/grpctrace"

	keystore "github.com/ipfs/go-ipfs-keystore"
	peer "github.com/libp2p/go-libp2p-core/peer"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.opentelemetry.io/otel/api/trace"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
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

func NewTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts) (*TestingProtocol, func()) {
	t.Helper()

	if opts == nil {
		opts = &TestingOpts{}
	}
	opts.applyDefaults(ctx)

	ipfsopts := &ipfsutil.TestingAPIOpts{
		Mocknet: opts.Mocknet,
		RDVPeer: opts.RDVPeer,
	}

	node, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, ipfsopts)

	serviceOpts := Opts{
		Logger:          opts.Logger,
		DeviceKeystore:  NewDeviceKeystore(keystore.NewMemKeystore()),
		MessageKeystore: NewInMemMessageKeystore(),
		IpfsCoreAPI:     node,
		TinderDriver:    node.Tinder(),
	}

	service, cleanupService := TestingService(t, serviceOpts)

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
	client, cleanupClient := TestingClientFromServer(t, server, service, clientOpts...)
	cleanup := func() {
		cleanupClient()
		cleanupService()
		cleanupNode()
	}

	tp := &TestingProtocol{
		Opts:    &serviceOpts,
		Client:  client,
		Service: service,
		IPFS:    node,
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

func generateTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts, n int) ([]*TestingProtocol, func()) {
	t.Helper()
	opts.applyDefaults(ctx)
	logger := opts.Logger

	rdvpeer, err := opts.Mocknet.GenPeer()
	_, cleanupRDVP := ipfsutil.TestingRDVP(ctx, t, rdvpeer)
	rdvpnet := opts.Mocknet.Net(rdvpeer.ID())
	require.NotNil(t, rdvpnet)

	opts.RDVPeer = rdvpeer.Peerstore().PeerInfo(rdvpeer.ID())

	cls := make([]func(), n)
	tps := make([]*TestingProtocol, n)
	for i := range tps {
		svcName := fmt.Sprintf("pt[%d]", i)
		opts.Logger = logger.Named(svcName)
		opts.TracerProvider = tracer.NewTestingProvider(t, svcName)

		tps[i], cls[i] = NewTestingProtocol(ctx, t, opts)
	}

	err = opts.Mocknet.LinkAll()
	require.NoError(t, err)

	for _, net := range opts.Mocknet.Nets() {
		if net != rdvpnet {
			_, err = opts.Mocknet.ConnectNets(net, rdvpnet)
			assert.NoError(t, err)
		}
	}

	return tps, func() {
		for i := range cls {
			cls[i]()
		}

		cleanupRDVP()
	}

}

// TestingService returns a configured Client struct with in-memory contexts.
func TestingService(t *testing.T, opts Opts) (Service, func()) {
	t.Helper()

	ctx := opts.RootContext
	if ctx == nil {
		ctx = context.Background()
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanupNode := func() {}

	if opts.IpfsCoreAPI == nil {
		opts.IpfsCoreAPI, cleanupNode = ipfsutil.TestingCoreAPI(ctx, t)
	}

	service, err := New(opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		service.Close()
		cleanupNode()
	}

	return service, cleanup
}

func TestingClientFromServer(t *testing.T, s *grpc.Server, svc Service, dialOpts ...grpc.DialOption) (client Client, cleanup func()) {
	t.Helper()

	var err error

	client, err = NewClientFromServer(s, svc, dialOpts...)
	require.NoError(t, err)
	cleanup = func() { client.Close() }

	return
}

func TestingClient(t *testing.T, svc Service, opts ...grpc.ServerOption) (client Client, cleanup func()) {
	t.Helper()

	var err error

	client, err = NewClient(svc, opts...)
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

	t.Fatal("not implemented")
}
