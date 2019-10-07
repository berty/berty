package protocoldb

import (
	"testing"

	"berty.tech/go/internal/gormutils"
	"berty.tech/go/internal/protocolmigrations"
	"berty.tech/go/internal/protocolmodel"
	"go.uber.org/zap"
)

func TestDropDatabase(t *testing.T) {
	gormutils.TestDropDatabase(t, Migrate, DropDatabase, zap.NewNop())
}

func TestAllTables(t *testing.T) {
	gormutils.TestAllTables(t, Init, Migrate, protocolmodel.AllTables(), zap.NewNop())
}

func TestAllMigrations(t *testing.T) {
	migrations := protocolmigrations.GetMigrations()
	if len(migrations) == 0 {
		t.Log("No migrations specified")
		t.Skip()
	}

	gormutils.TestAllMigrations(t, Init, Migrate, zap.NewNop())
}
