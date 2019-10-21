package protocoldb

import (
	"testing"

	"berty.tech/go/internal/gormutil"
	"berty.tech/go/internal/protocoldb/migrations"
	"berty.tech/go/internal/testutil"
)

func TestDropDatabase(t *testing.T) {
	db := TestingSqliteDB(t, testutil.Logger(t))

	err := DropDatabase(db)
	if err != nil {
		t.Fatalf("DropDatabase failed: %v", err)
	}

	count := len(gormutil.TestingGetTableNames(t, db))
	if count > 0 {
		t.Fatalf("Expected 0 tables, got %d.", count)
	}
}

func TestAllTables(t *testing.T) {
	db := TestingSqliteDB(t, testutil.Logger(t))
	gormutil.TestingHasExpectedTables(t, db, AllTables())
}

func TestAllMigrations(t *testing.T) {
	migrations := migrations.GetMigrations()
	if len(migrations) == 0 {
		t.Log("No migrations specified")
		t.Skip()
	}

	gormutil.TestingMigrationsVSAutoMigrate(t, migrations, AllModels(), testutil.Logger(t))
}
