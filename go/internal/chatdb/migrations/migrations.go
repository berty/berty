package migrations

import (
	//"berty.tech/go/internal/chatdb/migrations/v0001initial"
	"gopkg.in/gormigrate.v1"
)

// GetMigrations returns migrations for chat database
func GetMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		//v0001initial.GetMigration(),
	}
}
