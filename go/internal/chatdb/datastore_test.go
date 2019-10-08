package chatdb

import (
	"testing"

	"berty.tech/go/internal/chatdb/migrations"
	"berty.tech/go/internal/gormutils"
	"berty.tech/go/pkg/chatmodel"
	"go.uber.org/zap"
)

func TestDropDatabase(t *testing.T) {
	gormutils.TestDropDatabase(t, Migrate, DropDatabase, zap.NewNop())
}

func TestAllTables(t *testing.T) {
	gormutils.TestAllTables(t, Init, Migrate, chatmodel.AllTables(), zap.NewNop())
}

func TestAllMigrations(t *testing.T) {
	migrations := migrations.GetMigrations()
	if len(migrations) == 0 {
		t.Log("No migrations specified")
		t.Skip()
	}

	gormutils.TestAllMigrations(t, Init, Migrate, zap.NewNop())
}
