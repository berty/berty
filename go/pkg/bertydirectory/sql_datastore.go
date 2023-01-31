package bertydirectory

import (
	"time"

	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/directorytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type SQLDatastore struct {
	db *gorm.DB
}

func NewSQLDatastore(db *gorm.DB) (*SQLDatastore, error) {
	if err := db.AutoMigrate(&directorytypes.Record{}); err != nil {
		return nil, err
	}

	return &SQLDatastore{db: db}, nil
}

func (ds *SQLDatastore) Get(identifier string) (*directorytypes.Record, error) {
	result := &directorytypes.Record{}

	if err := ds.db.Model(&directorytypes.Record{}).
		Limit(1).
		First(&result, "`records`.`directory_identifier` = ? AND `records`.`expires_at` > ?", identifier, time.Now().UnixNano()).
		Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errcode.ErrNotFound
		}

		return nil, errcode.ErrDBRead.Wrap(err)
	}

	return result, nil
}

func (ds *SQLDatastore) Put(record *directorytypes.Record) error {
	if err := ds.Del(record.DirectoryIdentifier); err != nil && err != errcode.ErrNotFound {
		return errcode.ErrDBWrite.Wrap(err)
	}

	if err := ds.db.Model(&directorytypes.Record{}).Create(record).Error; err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	return nil
}

func (ds *SQLDatastore) Del(identifier string) error {
	query := ds.db.Model(&directorytypes.Record{}).Delete("directory_identifier = ?", identifier)

	if err := query.Error; err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	if query.RowsAffected == 0 {
		return errcode.ErrNotFound
	}

	return nil
}

var _ Datastore = (*SQLDatastore)(nil)
