package sql

import (
	"errors"

	"github.com/go-gormigrate/gormigrate"
	"github.com/jinzhu/gorm"

	"github.com/berty/berty/core/entity"
)

// Init configures an active gorm connection
func Init(db *gorm.DB) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)

	// FIXME: configure zap logger
	// FIXME: configure hard delete

	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "1",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(
					entity.Contact{},
				).Error
			},
			Rollback: func(tx *gorm.DB) error {
				return errors.New("not implemented")
			},
		},
	})
	if err := m.Migrate(); err != nil {
		return nil, err
	}

	return db, nil
}
