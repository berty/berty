package bertyprotocol

import (
	context "context"
	"testing"

	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/protocoldb"
	"go.uber.org/zap"
)

// TestingClient returns a configured Client struct with in-memory contexts.
func TestingClient(t *testing.T, opts Opts) (Client, func()) {
	t.Helper()

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	coreapi, err := ipfsutil.NewMockCoreAPI(context.TODO())
	if err != nil {
		t.Fatalf("failed to initialize ipfs: %v", err)
	}

	db := protocoldb.TestingSqliteDB(t, opts.Logger)

	client, err := New(db, coreapi, opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		client.Close()
		db.Close()
	}

	return client, cleanup
}
