package bertymessenger

import (
	"context"
	"testing"

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
	}
	server := New(opts.Client, &Opts{Logger: opts.Logger})
	return server, cleanup
}
