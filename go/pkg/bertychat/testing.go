package bertychat

import (
	"net"
	"testing"

	"berty.tech/go/internal/chatdb"
	"berty.tech/go/pkg/bertyprotocol"
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"
)

// TestingClient returns a configured Client struct with in-memory contexts.
func TestingClient(t *testing.T, opts Opts) (Client, func()) {
	t.Helper()

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	db := chatdb.TestingSqliteDB(t, opts.Logger)
	protocol, protocolCleanup := bertyprotocol.TestingClient(t, bertyprotocol.Opts{Logger: opts.Logger})

	client, err := New(db, protocol, opts)
	if err != nil {
		t.Fatalf("initialize client: %v", err)
	}

	cleanup := func() {
		client.Close()
		db.Close()
		protocolCleanup()
	}

	return client, cleanup
}

//TestingGRPCClient returns a configured ChatServiceClient connected to a TestingClient
func TestingGRPCClient(t *testing.T, opts Opts) (ChatServiceClient, func()) {
	t.Helper()

	client, clientCloser := TestingClient(t, opts)

	server := grpc.NewServer()
	RegisterChatServiceServer(server, client)

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("start listener: %v", err)
	}

	addr := listener.Addr().String()
	grpcConn, err := grpc.Dial(addr, grpc.WithInsecure())
	if err != nil {
		t.Fatalf("grpc dial: %v", err)
	}

	grpcClient := NewChatServiceClient(grpcConn)

	go func() {
		if err := server.Serve(listener); err != nil {
			t.Errorf("grpc.Server.Serve(): %v", err)
		}
	}()

	closer := func() {
		server.Stop()
		listener.Close()
		clientCloser()
	}

	return grpcClient, closer
}
