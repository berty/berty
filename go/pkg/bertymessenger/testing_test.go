package bertymessenger

import (
	"context"
	"net"
	"testing"

	"berty.tech/berty/v2/go/internal/testutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	libp2p_mocknet "github.com/libp2p/go-libp2p/p2p/net/mock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
	"moul.io/u"
)

func mkBufDialer(l *bufconn.Listener) func(context.Context, string) (net.Conn, error) {
	return func(context.Context, string) (net.Conn, error) {
		return l.Dial()
	}
}

func testingNode(ctx context.Context, t *testing.T) (*TestingAccount, func()) {
	t.Helper()

	logger, loggerCleanup := testutil.Logger(t)
	ctx, ctxCancel := context.WithCancel(ctx)
	clients, infraCleanup := testingInfra(ctx, t, 1, logger)
	node := NewTestingAccount(ctx, t, clients[0], logger)
	cleanup := func() {
		node.Close()
		infraCleanup()
		ctxCancel()
		loggerCleanup()
	}
	return node, cleanup
}

func testingInfra(ctx context.Context, t *testing.T, amount int, logger *zap.Logger) ([]MessengerServiceClient, func()) {
	t.Helper()
	mocknet := libp2p_mocknet.New(ctx)

	protocols, cleanup := bertyprotocol.NewTestingProtocolWithMockedPeers(ctx, t, &bertyprotocol.TestingOpts{Logger: logger, Mocknet: mocknet}, amount)
	clients := make([]MessengerServiceClient, amount)

	for i, p := range protocols {
		// new messenger service
		svc, cleanupMessengerService := TestingService(ctx, t, &TestingServiceOpts{Logger: logger, Client: p.Client, Index: i})

		// new messenger client
		lis := bufconn.Listen(1024 * 1024)
		s := grpc.NewServer()
		RegisterMessengerServiceServer(s, svc)
		go func() {
			err := s.Serve(lis)
			require.NoError(t, err)
		}()
		conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(mkBufDialer(lis)), grpc.WithInsecure())
		require.NoError(t, err)
		cleanup = u.CombineFuncs(func() {
			require.NoError(t, conn.Close())
			cleanupMessengerService()
		}, cleanup)
		clients[i] = NewMessengerServiceClient(conn)
	}

	require.NoError(t, mocknet.ConnectAllButSelf())

	return clients, cleanup
}
