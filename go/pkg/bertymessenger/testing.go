package bertymessenger

import (
	"context"
	"testing"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"moul.io/u"
	"moul.io/zapgorm2"
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

	zapLogger := zapgorm2.New(opts.Logger)
	zapLogger.SetAsDefault()
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{Logger: zapLogger})
	if err != nil {
		cleanup()
		require.NoError(t, err)
	}
	cleanup = u.CombineFuncs(
		func() {
			sqlDB, err := db.DB()
			assert.NoError(t, err)
			sqlDB.Close()
		},
		cleanup,
	)

	server, err := New(opts.Client, &Opts{Logger: opts.Logger, DB: db})
	if err != nil {
		cleanup()
		require.NoError(t, err)
	}

	cleanup = u.CombineFuncs(func() { server.Close() }, cleanup)

	return server, cleanup
}
