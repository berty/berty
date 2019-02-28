package sql

import (
	"berty.tech/core/sql/migrations"
	"github.com/go-gormigrate/gormigrate"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

// Init configures an active gorm connection
func Init(db *gorm.DB) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)
	db.SetLogger(&zapLogger{logger: zap.L().Named("vendor.gorm")})
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(true)
	// FIXME: configure hard delete
	return db, nil
}

func Migrate(db *gorm.DB, forceViaMigrations bool) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrations.GetMigrations())

	if !forceViaMigrations {
		m.InitSchema(func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				AllModels()...,
			).Error
		})
	}

	if err := m.Migrate(); err != nil {
		return err
	}

	return nil
}

func DropDatabase(db *gorm.DB) error {
	var tables []interface{}
	for _, table := range AllTables() {
		tables = append(tables, table)
	}
	return db.DropTableIfExists(tables...).Error
}
