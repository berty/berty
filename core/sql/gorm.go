package sql

import (
	"github.com/go-gormigrate/gormigrate"
	"github.com/jinzhu/gorm"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

// Init configures an active gorm connection
func Init(db *gorm.DB) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)
	db.SetLogger(&zapLogger{})
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(true)
	// FIXME: configure hard delete
	return db, nil
}

func Migrate(db *gorm.DB) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "1",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(
					p2p.Event{},
					entity.Contact{},
					entity.Conversation{},
					entity.ConversationMember{},
					entity.Device{},
					entity.Config{},
				).Error
			},
			Rollback: func(tx *gorm.DB) error {
				return DropDatabase(tx)
			},
		},
	})
	if err := m.Migrate(); err != nil {
		return err
	}

	return nil
}

func DropDatabase(db *gorm.DB) error {
	return db.DropTableIfExists(
		// base entities
		"config", "contact", "event", "device", "conversation", "conversation_member",

		// association tables

		// internal
		"migrations",
	).Error
}
