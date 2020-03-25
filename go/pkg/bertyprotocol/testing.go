package bertyprotocol

import (
	"context"
	"testing"

	"go.uber.org/zap"

	"berty.tech/berty/go/internal/ipfsutil"
)

// TestingClient returns a configured Client struct with in-memory contexts.
func TestingClient(t *testing.T, opts Opts) (Client, func()) {
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

	client, err := New(opts)
	if err != nil {
		t.Fatalf("failed to initialize client: %v", err)
	}

	cleanup := func() {
		client.Close()
		ipfsCoreClose()
	}

	return client, cleanup
}
