package daemon

import (
	fmt "fmt"
	"os"
	"path"

	"berty.tech/core/pkg/store"
)

func (d *Daemon) openStore(accountName string) (err error) {
	storagePath := d.GetStoragePath()
	if storagePath == "" {
		err = fmt.Errorf("no storage path set")
		return
	}

	switch d.config.StoreType {
	case Config_StoreMemory:
		d.store, err = store.NewInMemoryStore()
	case Config_StorePersist:
		filepath := fmt.Sprintf("%s/store/%s.store", storagePath, d.accountName)

		if err = os.MkdirAll(path.Dir(filepath), os.ModePerm); err != nil {
			return
		}

		if d.store, err = store.OpenPersistantStore(filepath); err != nil {
			err = fmt.Errorf("cannot init persistent store: %s", err.Error())
		}
	default:
		d.store = store.NewNoopStore()
	}

	return
}

func (d *Daemon) closeStore() error {
	return d.store.Close()
}
