package chatdb

import (
	"testing"

	"github.com/bwmarrin/snowflake"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

// TestingSqliteDB returns a configured chat gorm database.
func TestingSqliteDB(t *testing.T, logger *zap.Logger) *gorm.DB {
	t.Helper()

	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("gorm open: %v", err)
	}

	snowflakeNode, err := snowflake.NewNode(42)
	if err != nil {
		t.Fatalf("init snowflake: %v", err)
	}

	db, err = Init(db, snowflakeNode, logger)
	if err != nil {
		t.Fatalf("init db: %v", err)
	}

	err = Migrate(db, false)
	if err != nil {
		t.Fatalf("run migrations: %v", err)
	}

	return db
}
