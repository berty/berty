package gormutils

import (
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
	"gopkg.in/gormigrate.v1"
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

func Migrate(db *gorm.DB, migrationsGetter func() []*gormigrate.Migration, modelsGetter func() []interface{}, forceViaMigrations bool) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrationsGetter())

	if !forceViaMigrations {
		m.InitSchema(func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				modelsGetter()...,
			).Error
		})
	}

	if err := m.Migrate(); err != nil {
		return err
	}

	return nil
}

func DropDatabase(db *gorm.DB, tableNamesGetter func() []string) error {
	var tables []interface{}
	for _, table := range tableNamesGetter() {
		tables = append(tables, table)
	}
	return db.DropTableIfExists(tables...).Error
}
