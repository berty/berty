package migrations

import (
	"berty.tech/core/sql/migrations/v0001init"
	"berty.tech/core/sql/migrations/v0002pushtokens"
	"github.com/go-gormigrate/gormigrate"
)

func GetMigrations() []*gormigrate.Migration {
	functions := []*gormigrate.Migration{}

	functions = append(functions, v0001init.GetMigration())
	functions = append(functions, v0002pushtokens.GetMigration())

	return functions
}
