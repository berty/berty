package datastoremigrations

import (
	"berty.tech/go/internal/datastoremigrations/v0001initial"
	"gopkg.in/gormigrate.v1"
)

func GetMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		v0001initial.GetMigration(),
	}
}
