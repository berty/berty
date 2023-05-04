package repo

import (
	ds "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-datastore/keytransform"
)

type NamespacedDatastore struct {
	ds.Batching
	depth int
}

func (n *NamespacedDatastore) NewNamespace(prefix ds.Key) *NamespacedDatastore {
	return &NamespacedDatastore{
		Batching: keytransform.Wrap(n.Batching, keytransform.PrefixTransform{Prefix: prefix}),
		depth:    n.depth + 1,
	}
}

func (n *NamespacedDatastore) Close() error {
	if n.depth == 0 {
		return n.Batching.Close()
	}

	return nil
}

func NewNamespacedDatastore(child ds.Datastore, prefix ds.Key) *NamespacedDatastore {
	return &NamespacedDatastore{
		Batching: keytransform.Wrap(child, keytransform.PrefixTransform{Prefix: prefix}),
		depth:    0,
	}
}
