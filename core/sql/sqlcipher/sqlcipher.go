package sqlcipher

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	// sqlcipher blank import
	_ "github.com/xeodou/go-sqlcipher"
)

// Open initialize a new gorm db connection and configure sqlcipher key
//
// source can be
//   - a string in the following form '/tmp/db'
//   - a `*sql.DB` object
// key is the private key used for encryption
func Open(source interface{}, key []byte) (*gorm.DB, error) {
	// initialize gorm database
	db, err := gorm.Open("sqlite3", source)
	if err != nil {
		return nil, errors.Wrap(err, "failed to initialize a new gorm connection")
	}
	// FIXME: is here to avoid file is not a database
	db.DB().SetMaxIdleConns(1)
	db.DB().SetMaxOpenConns(1)
	// disable logger to prevent printing warns that are already returned
	db.LogMode(false)

	// set encryption key
	if err := db.Exec(fmt.Sprintf(`PRAGMA key = %q`, key)).Error; err != nil {
		return nil, errors.Wrap(err, "failed to set sqlcipher key")
	}

	// verify encryption key
	if err := db.Exec("SELECT 1 FROM sqlite_master").Error; err != nil {
		return nil, errors.Wrap(err, "invalid sqlcipher encryption key")
	}

	return db, nil
}
