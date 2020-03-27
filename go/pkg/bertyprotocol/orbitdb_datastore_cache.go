package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/cache"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-datastore/query"
)

type datastoreCache struct {
	ds datastore.Batching
}

func (d *datastoreCache) Load(directory string, dbAddress address.Address) (datastore.Datastore, error) {
	return ipfsutil.NewNamespacedDatastore(d.ds, datastore.NewKey(dbAddress.String())), nil
}

func (d *datastoreCache) Close() error {
	return nil
}

func (d *datastoreCache) Destroy(directory string, dbAddress address.Address) error {
	keys, err := ipfsutil.NewNamespacedDatastore(d.ds, datastore.NewKey(dbAddress.String())).Query(query.Query{KeysOnly: true})
	if err != nil {
		return nil
	}

	for {
		val, hasValue := keys.NextSync()
		if !hasValue {
			return nil
		}

		if err := d.ds.Delete(datastore.NewKey(val.Key)); err != nil {
			return err
		}
	}
}

func NewOrbitDatastoreCache(ds datastore.Batching) cache.Interface {
	return &datastoreCache{
		ds: ds,
	}
}

var _ cache.Interface = (*datastoreCache)(nil)
