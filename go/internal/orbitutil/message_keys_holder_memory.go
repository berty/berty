package orbitutil

import (
	"context"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

type InMemoryMessageKeysHolder struct {
	lock                 sync.RWMutex
	currentCKs           map[string]*bertyprotocol.DeviceSecret
	cache                map[string]map[uint64]*[32]byte
	usedKeys             map[cid.Cid]*[32]byte
	preComputedKeysCount int
	gc                   GroupContext
}

func (m *InMemoryMessageKeysHolder) GetGroupContext() GroupContext {
	return m.gc
}

func (m *InMemoryMessageKeysHolder) GetOwnDeviceChainKey(ctx context.Context) (*bertyprotocol.DeviceSecret, error) {
	m.lock.RLock()

	sk := m.GetGroupContext().GetDevicePrivKey()

	if sk == nil {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.RUnlock()

	return m.GetDeviceChainKey(ctx, sk.GetPublic())
}

func (m *InMemoryMessageKeysHolder) GetDeviceChainKey(ctx context.Context, pk crypto.PubKey) (*bertyprotocol.DeviceSecret, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	dPK, err := convertPubKeyToStringID(pk)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	ds, ok := m.currentCKs[dPK]
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	return ds, nil
}

func (m *InMemoryMessageKeysHolder) DelPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	dPK, err := convertPubKeyToStringID(device)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	_, ok := m.cache[dPK]
	if !ok {
		return errcode.ErrInvalidInput
	}

	_, ok = m.cache[dPK][counter]
	if !ok {
		return errcode.ErrInvalidInput
	}

	delete(m.cache[dPK], counter)

	return nil
}

func (m *InMemoryMessageKeysHolder) GetPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) (*[32]byte, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	dPK, err := convertPubKeyToStringID(device)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if _, ok := m.cache[dPK]; !ok {
		return nil, errcode.ErrMissingInput
	}

	dgs, ok := m.cache[dPK][counter]
	if !ok {
		return nil, errcode.ErrMissingInput
	}

	return dgs, nil
}

func (m *InMemoryMessageKeysHolder) HasPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64) (bool, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	dPK, err := convertPubKeyToStringID(device)
	if err != nil {
		return false, errcode.ErrSerialization.Wrap(err)
	}

	if _, ok := m.cache[dPK]; !ok {
		return false, nil
	}

	if _, ok := m.cache[dPK][counter]; !ok {
		return false, nil
	}

	return true, nil
}

func (m *InMemoryMessageKeysHolder) PutPrecomputedKey(ctx context.Context, device crypto.PubKey, counter uint64, mk *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	dPK, err := convertPubKeyToStringID(device)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	if _, ok := m.cache[dPK]; !ok {
		m.cache[dPK] = map[uint64]*[32]byte{}
	}

	m.cache[dPK][counter] = mk

	return nil
}

func (m *InMemoryMessageKeysHolder) PutKeyForCID(ctx context.Context, id cid.Cid, key *[32]byte) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	if !id.Defined() {
		return nil
	}

	m.usedKeys[id] = key

	return nil
}

func (m *InMemoryMessageKeysHolder) GetKeyForCID(ctx context.Context, id cid.Cid) (*[32]byte, error) {
	m.lock.RLock()
	defer m.lock.RUnlock()

	if !id.Defined() {
		return nil, errcode.ErrInvalidInput
	}

	key, ok := m.usedKeys[id]
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	return key, nil
}

func (m *InMemoryMessageKeysHolder) GetPrecomputedKeyExpectedCount() int {
	m.lock.RLock()
	defer m.lock.RUnlock()

	return m.preComputedKeysCount
}

func (m *InMemoryMessageKeysHolder) PutDeviceChainKey(ctx context.Context, device crypto.PubKey, ds *bertyprotocol.DeviceSecret) error {
	m.lock.Lock()
	defer m.lock.Unlock()

	dPK, err := convertPubKeyToStringID(device)
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	m.currentCKs[dPK] = ds

	return nil
}

// NewInMemoryMessageKeysHolder instantiate a new MessageKeyHolder, will be mainly used for testing
func NewInMemoryMessageKeysHolder(ctx context.Context, gc GroupContext, ds *bertyprotocol.DeviceSecret) (*InMemoryMessageKeysHolder, error) {
	if gc == nil {
		return nil, errcode.ErrInvalidInput
	}

	mkh := &InMemoryMessageKeysHolder{
		preComputedKeysCount: 100,
		gc:                   gc,
		currentCKs:           map[string]*bertyprotocol.DeviceSecret{},
		cache:                map[string]map[uint64]*[32]byte{},
		usedKeys:             map[cid.Cid]*[32]byte{},
	}

	if ds != nil {
		if err := RegisterChainKeyForDevice(ctx, mkh, gc.GetDevicePrivKey().GetPublic(), ds); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	gc.SetMessageKeysHolder(mkh)

	return mkh, nil
}
