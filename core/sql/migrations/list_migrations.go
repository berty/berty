package migrations

import (
	"berty.tech/core/sql/migrations/v0001init"
	"berty.tech/core/sql/migrations/v0002pushtokens"
	"berty.tech/core/sql/migrations/v0003notificationssettings"
	"berty.tech/core/sql/migrations/v0004conversationinfos"
	"berty.tech/core/sql/migrations/v0005eventdispatch"
	"berty.tech/core/sql/migrations/v0006conversationLogic"
	"berty.tech/core/sql/migrations/v0007eventdispatchretry"
	"berty.tech/core/sql/migrations/v0008eventdispatcherror"
	"berty.tech/core/sql/migrations/v0009conversationseenat"
	gormigrate "gopkg.in/gormigrate.v1"
)

func GetMigrations() []*gormigrate.Migration {
	migrations := []*gormigrate.Migration{}

	migrations = append(migrations, v0001init.GetMigration())
	migrations = append(migrations, v0002pushtokens.GetMigration())
	migrations = append(migrations, v0003notificationssettings.GetMigration())
	migrations = append(migrations, v0004conversationinfos.GetMigration())
	migrations = append(migrations, v0005eventdispatch.GetMigration())
	migrations = append(migrations, v0006conversationLogic.GetMigration())
	migrations = append(migrations, v0007eventdispatchretry.GetMigration())
	migrations = append(migrations, v0008eventdispatcherror.GetMigration())
	migrations = append(migrations, v0009conversationseenat.GetMigration())

	return migrations
}
