package bertyprotocol

import (
	"context"
	"sync"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type MessageKeystore struct {
	lock                 sync.RWMutex
	preComputedKeysCount int
	store                datastore.Datastore
}

func (m *MessageKeystore) GetDeviceChainKey(ctx context.Context, pk crypto.PubKey) (*bertytypes.DeviceSecret, error) {
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
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	ds := &bertytypes.DeviceSecret{}
	if err := ds.Unmarshal(dsBytes); err != nil {
		return nil, errcode.ErrInvalidInput
	}

	return ds, nil
}

func (m *MessageKeystore) DelPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) error {
	m.lock.RLock()
	defer m.lock.RUnlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)
	if err := m.store.Delete(id); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) GetPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) (*[32]byte, error) {
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
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	keyArray, err := cryptoutil.KeySliceToArray(key)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return keyArray, nil
}

func (m *MessageKeystore) PutPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64, mk *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)

	if err := m.store.Put(id, mk[:]); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) PutKeyForCID(ctx context.Context, id cid.Cid, key *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	if !id.Defined() {
		return nil
	}

	err := m.store.Put(idForCID(id), key[:])
	if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) GetKeyForCID(ctx context.Context, id cid.Cid) (*[32]byte, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	if !id.Defined() {
		return nil, errcode.ErrInvalidInput
	}

	key, err := m.store.Get(idForCID(id))
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrInvalidInput
	}

	keyArray, err := cryptoutil.KeySliceToArray(key)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return keyArray, nil
}

func (m *MessageKeystore) GetPrecomputedKeyExpectedCount() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.preComputedKeysCount
}

func (m *MessageKeystore) PutDeviceChainKey(ctx context.Context, device crypto.PubKey, ds *bertytypes.DeviceSecret) error {
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
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

// NewMessageKeystore instantiate a new MessageKeystore
func NewMessageKeystore(s datastore.Datastore) *MessageKeystore {
	return &MessageKeystore{
		preComputedKeysCount: 100,
		store:                s,
	}
}

// NewInMemMessageKeystore instantiate a new MessageKeystore, useful for testing
func NewInMemMessageKeystore() *MessageKeystore {
	return NewMessageKeystore(dssync.MutexWrap(datastore.NewMapDatastore()))
}
