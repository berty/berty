package datastore

import (
	"testing"

	"berty.tech/go/internal/datastoremigrations"
	models "berty.tech/go/internal/datastoremodels"
	"berty.tech/go/internal/gormutils"
	"go.uber.org/zap"
)

func TestDropDatabase(t *testing.T) {
	gormutils.TestDropDatabase(t, Migrate, DropDatabase, zap.NewNop())
}

func TestAllTables(t *testing.T) {
	gormutils.TestAllTables(t, Init, Migrate, models.AllTables(), zap.NewNop())
}

func TestAllMigrations(t *testing.T) {
	migrations := datastoremigrations.GetMigrations()
	if len(migrations) == 0 {
		t.Log("No migrations specified")
		t.Skip()
	}

	gormutils.TestAllMigrations(t, Init, Migrate, zap.NewNop())
}
