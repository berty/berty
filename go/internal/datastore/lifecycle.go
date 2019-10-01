package datastore

import (
	"berty.tech/go/internal/datastore/models"
	"berty.tech/go/internal/datastoremigrations"
	"berty.tech/go/pkg/gormutils"
	"github.com/jinzhu/gorm"
)

func Init(db *gorm.DB) (*gorm.DB, error) {
	return gormutils.Init(db)
}

func Migrate(db *gorm.DB, forceViaMigrations bool) error {
	return gormutils.Migrate(db, datastoremigrations.GetMigrations, models.AllModels, forceViaMigrations)
}

func InitMigrate(db *gorm.DB) (*gorm.DB, error) {
	db, err := Init(db)
	if err != nil {
		return nil, err
	}

	err = Migrate(db, false)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func DropDatabase(db *gorm.DB) error {
	return gormutils.DropDatabase(db, models.AllTables)
}
