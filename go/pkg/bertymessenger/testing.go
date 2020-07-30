package bertymessenger

import (
	"context"
	"testing"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
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

	pCleanup := func() {}
	if opts.Client == nil {
		var protocol *bertyprotocol.TestingProtocol
		protocol, pCleanup = bertyprotocol.NewTestingProtocol(ctx, t, nil)
		opts.Client = protocol.Client
		// required to avoid "writing on closing socket",
		// should be better to have something blocking instead
		time.Sleep(10 * time.Millisecond)
	}

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		pCleanup()
		require.NoError(t, err)
	}

	server, err := New(opts.Client, &Opts{Logger: opts.Logger, DB: db})
	if err != nil {
		sqlDB, _ := db.DB()
		sqlDB.Close()
		pCleanup()
		require.NoError(t, err)
	}

	cleanup := func() {
		server.Close()
		sqlDB, _ := db.DB()
		sqlDB.Close()
		require.NoError(t, err)
		pCleanup()
	}

	return server, cleanup
}
