package ipfsutil

import (
	ds "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-datastore/keytransform"
)

type namespacedDatastore struct {
	ds.Batching
}

func (n *namespacedDatastore) Close() error {
	// noop
	return nil
}

func NewNamespacedDatastore(child ds.Datastore, prefix ds.Key) ds.Batching {
	return &namespacedDatastore{Batching: keytransform.Wrap(child, keytransform.PrefixTransform{Prefix: prefix})}
}
