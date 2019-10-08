package protocoldb

import (
	"testing"

	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

// TestingSqliteDB returns a configured protocol gorm database.
func TestingSqliteDB(t *testing.T, logger *zap.Logger) *gorm.DB {
	t.Helper()

	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to initialize in-memory sqlite srever: %v", err)
	}

	db, err = Init(db, logger)
	if err != nil {
		t.Fatalf("failed to configure database: %v", err)
	}

	err = Migrate(db, false, logger)
	if err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}

	return db
}
