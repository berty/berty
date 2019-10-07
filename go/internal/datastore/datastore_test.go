package datastore

import (
	"testing"

	"berty.tech/go/internal/datastoremigrations"

	models "berty.tech/go/internal/datastoremodels"

	"berty.tech/go/internal/gormutils"
)

func TestDropDatabase(t *testing.T) {
	gormutils.TestDropDatabase(t, Migrate, DropDatabase)
}

func TestAllTables(t *testing.T) {
	gormutils.TestAllTables(t, Init, Migrate, models.AllTables())
}

func TestAllMigrations(t *testing.T) {
	migrations := datastoremigrations.GetMigrations()
	if len(migrations) == 0 {
		t.Log("No migrations specified")
		return
	}

	gormutils.TestAllMigrations(t, Init, Migrate)
}
