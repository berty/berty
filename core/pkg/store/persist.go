package store

import (
	leveldb "github.com/syndtr/goleveldb/leveldb"
)

type Persist struct {
	db *leveldb.DB
}

func OpenPersistantStore(filepath string) (Store, error) {
	// open store
	db, err := leveldb.OpenFile(filepath, nil)
	if err != nil {
		return nil, err
	}

	return &Persist{db}, nil
}

func (ps *Persist) Put(key string, value []byte) error {
	return ps.db.Put([]byte(key), value, nil)
}

func (ps *Persist) Get(key string) ([]byte, error) {
	return ps.db.Get([]byte(key), nil)
}

func (ps *Persist) Close() error {
	return ps.db.Close()
}
