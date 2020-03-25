package bertyprotocol

import (
	"context"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/errcode"
)

type DatastoreMessageKeys struct {
	lock                 sync.RWMutex
	preComputedKeysCount int
	store                datastore.Datastore
}

func (m *DatastoreMessageKeys) GetDeviceChainKey(ctx context.Context, pk crypto.PubKey) (*DeviceSecret, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	pkB, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	key := idForCurrentCK(pkB)

	dsBytes, err := m.store.Get(key)
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput
	} else if err != nil {
		return nil, errcode.ErrPersistenceGet.Wrap(err)
	}

	ds := &DeviceSecret{}
	if err := ds.Unmarshal(dsBytes); err != nil {
		return nil, errcode.ErrInvalidInput
	}

	return ds, nil
}

func (m *DatastoreMessageKeys) DelPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) error {
	m.lock.RLock()
	defer m.lock.RUnlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)
	if err := m.store.Delete(id); err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

func (m *DatastoreMessageKeys) GetPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) (*[32]byte, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)

	key, err := m.store.Get(id)

	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput
	} else if err != nil {
		return nil, errcode.ErrPersistenceGet.Wrap(err)
	}

	return to32ByteArray(key), nil
}

func (m *DatastoreMessageKeys) PutPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64, mk *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)

	if err := m.store.Put(id, from32ByteArray(mk)); err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

func (m *DatastoreMessageKeys) PutKeyForCID(ctx context.Context, id cid.Cid, key *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	if !id.Defined() {
		return nil
	}

	err := m.store.Put(idForCID(id), from32ByteArray(key))
	if err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

func (m *DatastoreMessageKeys) GetKeyForCID(ctx context.Context, id cid.Cid) (*[32]byte, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	if !id.Defined() {
		return nil, errcode.ErrInvalidInput
	}

	key, err := m.store.Get(idForCID(id))
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrInvalidInput
	}

	if len(key) != 32 {
		return nil, errcode.ErrInternal
	}

	return to32ByteArray(key), nil
}

func (m *DatastoreMessageKeys) GetPrecomputedKeyExpectedCount() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.preComputedKeysCount
}

func (m *DatastoreMessageKeys) PutDeviceChainKey(ctx context.Context, device crypto.PubKey, ds *DeviceSecret) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	key := idForCurrentCK(deviceRaw)

	data, err := ds.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	err = m.store.Put(key, data)
	if err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

// NewDatastoreMessageKeys instantiate a new MessageKeyHolder
func NewDatastoreMessageKeys(s datastore.Datastore) *DatastoreMessageKeys {
	return &DatastoreMessageKeys{
		preComputedKeysCount: 100,
		store:                s,
	}
}

// NewInMemoryMessageKeys instantiate a new MessageKeyHolder, useful for testing
func NewInMemoryMessageKeys() *DatastoreMessageKeys {
	return NewDatastoreMessageKeys(dssync.MutexWrap(datastore.NewMapDatastore()))
}

var _ MessageKeys = (*DatastoreMessageKeys)(nil)
