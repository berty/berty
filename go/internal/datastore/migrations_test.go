package datastore

import (
	"testing"

	"berty.tech/go/internal/datastore/models"

	"berty.tech/go/pkg/gormutils"
)

func TestDropDatabase(t *testing.T) {
	gormutils.TestDropDatabase(t, Migrate, DropDatabase)
}

func TestAllTables(t *testing.T) {
	gormutils.TestAllTables(t, Init, Migrate, models.AllTables())
}

func TestAllMigrations(t *testing.T) {
	gormutils.TestAllMigrations(t, Init, Migrate)
}
