package datastore

import (
	"berty.tech/go/internal/datastore/models/config"
	"berty.tech/go/pkg/iface"
	"github.com/jinzhu/gorm"
)

type datastore struct {
	db         *gorm.DB
	configRepo iface.ConfigRepository
}

func (d *datastore) Config() iface.ConfigRepository {
	return d.configRepo
}

func NewDatastore(db *gorm.DB) (iface.DataStore, error) {
	db, err := Init(db)

	if err != nil {
		return nil, err
	}

	err = Migrate(db, true)
	if err != nil {
		return nil, err
	}

	d := &datastore{
		db: db,
	}

	d.configRepo = config.NewRepository(db)

	return d, nil
}

var _ iface.DataStore = (*datastore)(nil)
