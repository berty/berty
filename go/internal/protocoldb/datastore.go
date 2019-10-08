package protocoldb

import (
	"berty.tech/go/internal/gormutils"
	"berty.tech/go/internal/protocoldb/migrations"
	"berty.tech/go/pkg/protocolmodel"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

// Init configures an active gorm connection
func Init(db *gorm.DB, logger *zap.Logger) (*gorm.DB, error) {
	return gormutils.Init(db, logger)
}

// Migrate runs migrations
func Migrate(db *gorm.DB, forceViaMigrations bool, logger *zap.Logger) error {
	return gormutils.Migrate(db, migrations.GetMigrations, protocolmodel.AllModels, forceViaMigrations, logger)
}

// InitMigrate is an alias for Init() and Migrate()
func InitMigrate(db *gorm.DB, logger *zap.Logger) (*gorm.DB, error) {
	db, err := Init(db, logger)
	if err != nil {
		return nil, err
	}

	err = Migrate(db, false, logger)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// DropDatabase drops all the tables of a database
func DropDatabase(db *gorm.DB) error {
	return gormutils.DropDatabase(db, protocolmodel.AllTables)
}
