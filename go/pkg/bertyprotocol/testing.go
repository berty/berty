package bertyprotocol

import (
	"context"
	"fmt"
	"testing"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"

	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
)

type TestingProtocol struct {
	Opts *Opts

	Service Service
	Client  Client
	IPFS    ipfsutil.CoreAPIMock
}

type TestingOpts struct {
	Logger  *zap.Logger
	Mocknet libp2p_mocknet.Mocknet
}

func NewTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts) (*TestingProtocol, func()) {
	t.Helper()

	var node ipfsutil.CoreAPIMock

	if opts.Mocknet != nil {
		node = ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, opts.Mocknet)
	} else {
		node = ipfsutil.TestingCoreAPI(ctx, t)
	}

	serviceOpts := Opts{
		Logger:          opts.Logger,
		DeviceKeystore:  NewDeviceKeystore(keystore.NewMemKeystore()),
		MessageKeystore: NewInMemMessageKeystore(),
		IpfsCoreAPI:     node,
	}

	// setup grpc

	// setup grpc server
	grpcLogger := opts.Logger.Named("grpc")
	// Define customfunc to handle panic
	panicHandler := func(p interface{}) (err error) {
		return status.Errorf(codes.Unknown, "panic recover: %v", p)
	}

	// Shared options for the logger, with a custom gRPC code to log level function.
	recoverOpts := []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandler(panicHandler),
	}

	zapOpts := []grpc_zap.Option{}

	serverOpts := []grpc.ServerOption{
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),

			grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
			grpc_recovery.UnaryServerInterceptor(recoverOpts...),
		),
		grpc_middleware.WithStreamServerChain(
			grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
			grpc_recovery.StreamServerInterceptor(recoverOpts...),
		),
	}

	service, cleanupService := TestingService(t, serviceOpts)
	client, cleanupClient := TestingClient(t, service, serverOpts...)

	cleanup := func() {
		cleanupClient()
		cleanupService()
		node.Close()
	}

	tp := &TestingProtocol{
		Opts:    &serviceOpts,
		Client:  client,
		Service: service,
		IPFS:    node,
	}

	return tp, cleanup
}

func generateTestingProtocol(ctx context.Context, t *testing.T, opts *TestingOpts, n int) ([]*TestingProtocol, func()) {
	t.Helper()

	cls := make([]func(), n)
	cleanup := func() {
		for i := range cls {
			if cls[i] != nil {
				cls[i]()
			}
		}
	}

	if opts.Mocknet == nil {
		opts.Mocknet = libp2p_mocknet.New(ctx)
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	logger := opts.Logger

	tps := make([]*TestingProtocol, n)
	for i := range tps {
		opts.Logger = logger.Named(fmt.Sprintf("pt[%d]", i))
		tps[i], cls[i] = NewTestingProtocol(ctx, t, opts)
	}

	err := opts.Mocknet.LinkAll()
	require.NoError(t, err)

	return tps, cleanup
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

	ipfsCoreClose := func() {}

	if opts.IpfsCoreAPI == nil {
		ca := ipfsutil.TestingCoreAPI(ctx, t)
		opts.IpfsCoreAPI = ca
		ipfsCoreClose = ca.Close
	}

	service, err := New(opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		service.Close()
		ipfsCoreClose()
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
type ConnnectTestingProtocolFunc func(*testing.T, []*TestingProtocol)

// ConnectAll peers between themselves
func ConnectAll(t *testing.T, pts []*TestingProtocol) {
	t.Helper()

	// connect all pts together
	for _, pt := range pts {
		err := pt.IPFS.MockNetwork().ConnectAllButSelf()
		require.NoError(t, err)
	}
}

// ConnectInLine, connect peers one by one in order to make a straight line:
// ┌───┐    ┌───┐    ┌───┐         ┌───┐
// │ 1 │───▶│ 2 │───▶│ 3 │─ ─ ─ ─ ▶│ x │
// └───┘    └───┘    └───┘         └───┘

func ConnectInLine(t *testing.T, pts []*TestingProtocol) {
	t.Helper()

	for i := range pts {
		if i > 0 {
			id0 := pts[i-1].IPFS.MockNode().Identity
			id1 := pts[i].IPFS.MockNode().Identity
			_, err := pts[i].IPFS.MockNetwork().ConnectPeers(id0, id1)
			require.NoError(t, err)
		}
	}
}
