package migrations

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
)

func testMigration(t *testing.T, ks accountutils.NativeKeystore) {
	logger, err := zap.NewDevelopment()
	require.NoError(t, err)

	tmpDir := t.TempDir()
	appDir := filepath.Join(tmpDir, "app")
	sharedDir := filepath.Join(tmpDir, "shared")

	err = MigrateToLatest(Options{
		AppDir:         appDir,
		SharedDir:      sharedDir,
		NativeKeystore: ks,
		Logger:         logger,
	})
	require.NoError(t, err)

	// FIXME: check that the data match latest version
}

func Test_Migration(t *testing.T) {
	testMigration(t, accountutils.NewMemNativeKeystore())
}

func Test_Migration_NoKeystore(t *testing.T) {
	testMigration(t, nil)
}
