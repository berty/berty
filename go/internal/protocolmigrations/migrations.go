package protocolmigrations

import (
	//"berty.tech/go/internal/protocolmigrations/v0001initial"
	"gopkg.in/gormigrate.v1"
)

// GetMigrations returns a list of migrations for protocol database
func GetMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		//v0001initial.GetMigration(),
	}
}
