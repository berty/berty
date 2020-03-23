package bertyprotocol

import (
	"context"
	"testing"

	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/protocoldb"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

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

	if opts.IpfsCoreAPI == nil {
		opts.IpfsCoreAPI = ipfsutil.TestingCoreAPI(ctx, t)
	}

	db := protocoldb.TestingSqliteDB(t, opts.Logger)

	client, err := New(db, opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		client.Close()
		db.Close()
	}

	return client, cleanup
}

// TestingClient returns a configured Client struct with in-memory contexts.
func TestingClient(t *testing.T, svc Service) (Client, func()) {
	t.Helper()

	client, err := NewClient(svc)
	require.NoError(t, err)

	return client, func() { client.Close() }
}
