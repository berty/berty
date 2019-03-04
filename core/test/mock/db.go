package mock

import (
	"io/ioutil"

	"os"

	gormigrate "gopkg.in/gormigrate.v1"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"

	// sqlcipher blank import
	_ "github.com/xeodou/go-sqlcipher"
)

// Init configures an active gorm connection
func Init(db *gorm.DB) (*gorm.DB, error) {
	db = db.Set("gorm:auto_preload", true)
	db = db.Set("gorm:association_autoupdate", false)
	db.SingularTable(true)
	db.BlockGlobalUpdate(true)
	db.LogMode(false)
	// FIXME: configure hard delete
	return db, nil
}

func Migrate(db *gorm.DB, models ...interface{}) error {
	m := gormigrate.New(db, gormigrate.DefaultOptions, []*gormigrate.Migration{
		{
			ID: "1",
			Migrate: func(tx *gorm.DB) error {
				return tx.AutoMigrate(models...).Error
			},
			Rollback: func(tx *gorm.DB) error {
				models := append(models, "migrations")

				return db.DropTableIfExists(models...).Error
			},
		},
	})
	if err := m.Migrate(); err != nil {
		return err
	}

	return nil
}

func GetMockedDbForPath(dbPath string, models ...interface{}) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	db, err = gorm.Open("sqlite3", dbPath)
	if err != nil {
		return nil, errors.Wrap(err, "failed to initialize a new gorm connection")
	}

	db.DB().SetMaxIdleConns(1)
	db.DB().SetMaxOpenConns(1)
	// disable logger to prevent printing warns that are already returned
	db.LogMode(false)

	if db, err = Init(db); err != nil {
		return nil, errors.Wrap(err, "failed to initialize sql")
	}
	if err = Migrate(db, models...); err != nil {
		return nil, errors.Wrap(err, "failed to apply sql migrations")
	}

	return db, nil
}

func GetMockedDb(models ...interface{}) (string, *gorm.DB, error) {
	tmpFile, err := ioutil.TempFile("", "sqlite")

	if err != nil {
		return "", nil, err
	}

	db, err := GetMockedDbForPath(tmpFile.Name(), models...)

	return tmpFile.Name(), db, err
}

func RemoveDb(path string, db *gorm.DB) {
	db.Close()
	os.Remove(path)
}
