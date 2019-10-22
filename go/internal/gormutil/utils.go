package gormutil

import (
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
	"gopkg.in/gormigrate.v1"
)

// Init configures an active gorm connection
func Init(db *gorm.DB, logger *zap.Logger) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", false) // WARNING: if true, we need to be 100% sure that we don't have circular dependencies in our model definitions
	db = db.Set("gorm:association_autoupdate", false)
	db.SetLogger(&zapLogger{logger: logger})
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(true)
	// FIXME: configure hard delete
	return db, nil
}

// Migrate runs migrations
func Migrate(db *gorm.DB, migrations []*gormigrate.Migration, models []interface{}, forceViaMigrations bool) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, migrations)

	if !forceViaMigrations {
		m.InitSchema(func(tx *gorm.DB) error {
			return tx.AutoMigrate(models...).Error
		})
	}

	return m.Migrate()
}

// DropDatabase drops all tables of a database
func DropDatabase(db *gorm.DB, tableNames []string) error {
	var tables []interface{}
	for _, table := range tableNames {
		tables = append(tables, table)
	}
	return db.DropTableIfExists(tables...).Error
}
