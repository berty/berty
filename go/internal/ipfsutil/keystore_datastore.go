package ipfsutil

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/keystore"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type datastoreKeystore struct {
	ds datastore.Datastore
}

func (k *datastoreKeystore) Has(name string) (bool, error) {
	return k.ds.Has(datastore.NewKey(name))
}

func (k *datastoreKeystore) Put(name string, key crypto.PrivKey) error {
	bytes, err := key.Bytes()
	if err != nil {
		return err
	}

	return k.ds.Put(datastore.NewKey(name), bytes)
}

func (k *datastoreKeystore) Get(name string) (crypto.PrivKey, error) {
	bytes, err := k.ds.Get(datastore.NewKey(name))
	if err == datastore.ErrNotFound {
		return nil, keystore.ErrNoSuchKey
	} else if err != nil {
		return nil, err
	}

	return crypto.UnmarshalPrivateKey(bytes)
}

func (k *datastoreKeystore) Delete(name string) error {
	return k.ds.Delete(datastore.NewKey(name))
}

func (k *datastoreKeystore) List() ([]string, error) {
	return nil, errcode.ErrNotImplemented
}

func NewDatastoreKeystore(ds datastore.Datastore) keystore.Keystore {
	return &datastoreKeystore{
		ds: ds,
	}
}
