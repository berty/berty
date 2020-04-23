package bertydemo

import (
	"context"
	"testing"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"google.golang.org/grpc"
)

type cleanFunc func()

func testingInMemoryClientWithOpts(t *testing.T, netOpts *ipfsutil.TestingAPIOpts) (*Service, ipfsutil.CoreAPIMock, cleanFunc) {
	t.Helper()

	ctx := context.Background()
	ipfsmock, cleanupNode := ipfsutil.TestingCoreAPIUsingMockNet(ctx, t, netOpts)
	opts := &Opts{
		CoreAPI:          ipfsmock,
		OrbitDBDirectory: ":memory:",
	}

	demo, err := New(opts)
	if err != nil {
		t.Fatal(err)
	}

	return demo, ipfsmock, func() {
		demo.Close()
		cleanupNode()
	}
}

func testingInMemoryClient(t *testing.T) (*Service, ipfsutil.CoreAPIMock, cleanFunc) {
	t.Helper()

	ctx := context.Background()

	mn := mocknet.New(ctx)
	rdvp, err := mn.GenPeer()
	if err != nil {
		t.Fatal(err)
	}

	demo, ipfsmock, cleanup := testingInMemoryClientWithOpts(t, &ipfsutil.TestingAPIOpts{
		Mocknet: mn,
		RDVPeer: rdvp.Peerstore().PeerInfo(rdvp.ID()),
	})

	return demo, ipfsmock, func() {
		cleanup()
		_ = rdvp.Close()
	}
}

func testingClientService(t *testing.T, srv DemoServiceServer) (DemoServiceClient, cleanFunc) {
	t.Helper()

	listener := grpcutil.NewPipeListener()

	server := grpc.NewServer()
	RegisterDemoServiceServer(server, srv)

	conn, err := listener.NewClientConn(grpc.WithInsecure())
	if err != nil {
		t.Fatal(err)
	}

	go server.Serve(listener)

	return NewDemoServiceClient(conn), func() {
		listener.Close()
	}
}
