package bertymessenger

import (
	"context"
	"testing"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"go.uber.org/zap"
)

type TestingServiceOpts struct {
	Logger *zap.Logger
	Client bertyprotocol.Client
}

func TestingService(ctx context.Context, t *testing.T, opts *TestingServiceOpts) (MessengerServiceServer, func()) {
	t.Helper()
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	cleanup := func() {}
	if opts.Client == nil {
		var protocol *bertyprotocol.TestingProtocol
		protocol, cleanup = bertyprotocol.NewTestingProtocol(ctx, t, nil)
		opts.Client = protocol.Client
		// required to avoid "writing on closing socket",
		// should be better to have something blocking instead
		time.Sleep(10 * time.Millisecond)
	}
	server := New(opts.Client, &Opts{Logger: opts.Logger})
	return server, cleanup
}
