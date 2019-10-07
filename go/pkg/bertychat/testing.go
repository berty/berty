package bertychat

import (
	"testing"

	"berty.tech/go/internal/chatdb"
	"berty.tech/go/pkg/bertyprotocol"
	"go.uber.org/zap"
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
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		client.Close()
		db.Close()
		protocolCleanup()
	}

	return client, cleanup
}
