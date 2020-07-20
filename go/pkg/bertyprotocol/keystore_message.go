package bertyprotocol

import (
	"context"
	"sync"

	"fmt"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"
)

type MessageKeystore struct {
	lock                 sync.Mutex
	preComputedKeysCount int
	store                datastore.Datastore
}

type decryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func (m *MessageKeystore) getDeviceChainKey(pk crypto.PubKey) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	pkB, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	key := idForCurrentCK(pkB)

	dsBytes, err := m.store.Get(key)
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput
	}
	if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	ds := &bertytypes.DeviceSecret{}
	if err := ds.Unmarshal(dsBytes); err != nil {
		return nil, errcode.ErrInvalidInput
	}

	return ds, nil
}

func (m *MessageKeystore) delPrecomputedKey(device crypto.PubKey, counter uint64) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

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

func (m *MessageKeystore) postDecryptActions(di *decryptInfo, g *bertytypes.Group, ownPK crypto.PubKey, headers *bertytypes.MessageHeaders) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	// Message was newly decrypted, we can save the message key and derive
	// future keys if necessary.
	if di == nil || !di.NewlyDecrypted {
		return nil
	}

	var (
		ds  *bertytypes.DeviceSecret
		err error
	)

	pk, err := crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if err = m.putKeyForCID(di.Cid, di.MK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err = m.delPrecomputedKey(pk, headers.Counter); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds, err = m.getDeviceChainKey(pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ds, err = m.preComputeKeys(pk, g, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// If the message was not emitted by the current device we might need
	// to update the current chain key
	if ownPK == nil || !ownPK.Equals(pk) {
		if err = m.updateCurrentKey(pk, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func (m *MessageKeystore) GetDeviceSecret(g *bertytypes.Group, acc DeviceKeystore) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	md, err := acc.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ds, err := m.getDeviceChainKey(md.device.GetPublic())

	if errcode.Is(err, errcode.ErrMissingInput) {
		// If secret does not exist, create it
		ds, err := newDeviceSecret()
		if err != nil {
			return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		if err = m.registerChainKey(g, md.device.GetPublic(), ds, true); err != nil {
			return nil, errcode.ErrMessageKeyPersistencePut.Wrap(err)
		}

		return ds, nil
	}
	if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	return ds, nil
}

func (m *MessageKeystore) RegisterChainKey(g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	return m.registerChainKey(g, devicePK, ds, isOwnPK)
}

func (m *MessageKeystore) registerChainKey(g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	var err error

	if _, err := m.getDeviceChainKey(devicePK); err == nil {
		// device is already registered, ignore it
		return nil
	}

	// If own device store key as is, no need to precompute future keys
	if isOwnPK {
		if err := m.putDeviceChainKey(devicePK, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = m.preComputeKeys(devicePK, g, ds); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err := m.putDeviceChainKey(devicePK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) preComputeKeys(device crypto.PubKey, g *bertytypes.Group, ds *bertytypes.DeviceSecret) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	ck := ds.ChainKey
	counter := ds.Counter

	knownCK, err := m.getDeviceChainKey(device)
	if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	for i := 1; i <= m.getPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownMK, err := m.getPrecomputedKey(device, counter)
		if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
			return nil, errcode.ErrInternal.Wrap(err)
		}

		if knownMK != nil && knownCK != nil {
			if knownCK.Counter != counter-1 {
				continue
			}
		}

		// TODO: Salt?
		newCK, mk, err := deriveNextKeys(ck, nil, g.GetPublicKey())
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		err = m.putPrecomputedKey(device, counter, &mk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		ck = newCK
	}

	return &bertytypes.DeviceSecret{
		Counter:  counter,
		ChainKey: ck,
	}, nil
}

func (m *MessageKeystore) getPrecomputedKey(device crypto.PubKey, counter uint64) (*[32]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	deviceRaw, err := device.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(deviceRaw, counter)

	key, err := m.store.Get(id)

	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput.Wrap(fmt.Errorf("key for message does not exist in datastore"))
	}
	if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	keyArray, err := cryptoutil.KeySliceToArray(key)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return keyArray, nil
}

func (m *MessageKeystore) putPrecomputedKey(device crypto.PubKey, counter uint64, mk *[32]byte) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

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

func (m *MessageKeystore) putKeyForCID(id cid.Cid, key *[32]byte) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	if !id.Defined() {
		return nil
	}

	err := m.store.Put(idForCID(id), key[:])
	if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) OpenEnvelope(ctx context.Context, g *bertytypes.Group, ownPK crypto.PubKey, data []byte, id cid.Cid) (*bertytypes.MessageHeaders, []byte, error) {
	if m == nil || g == nil {
		return nil, nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	env, headers, err := openEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, decryptInfo, err := m.openPayload(id, env.Message, headers)
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	if err := m.postDecryptActions(decryptInfo, g, ownPK, headers); err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return headers, msg, nil
}

func (m *MessageKeystore) openPayload(id cid.Cid, payload []byte, headers *bertytypes.MessageHeaders) ([]byte, *decryptInfo, error) {
	if m == nil {
		return nil, nil, errcode.ErrInvalidInput
	}

	var (
		err error
		di  = &decryptInfo{
			Cid:            id,
			NewlyDecrypted: true,
		}
	)

	if di.MK, err = m.getKeyForCID(id); err == nil {
		di.NewlyDecrypted = false
	} else {
		pk, err := crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
		if err != nil {
			return nil, nil, errcode.ErrDeserialization.Wrap(err)
		}

		di.MK, err = m.getPrecomputedKey(pk, headers.Counter)
		if err != nil {
			return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
		}
	}

	msg, ok := secretbox.Open(nil, payload, uint64AsNonce(headers.Counter), di.MK)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt
	}

	// Message was newly decrypted, we can save the message key and derive
	// future keys if necessary.
	return msg, di, nil
}

func (m *MessageKeystore) getKeyForCID(id cid.Cid) (*[32]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

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

func (m *MessageKeystore) getPrecomputedKeyExpectedCount() int {
	if m == nil {
		return 0
	}

	return m.preComputedKeysCount
}

func (m *MessageKeystore) putDeviceChainKey(device crypto.PubKey, ds *bertytypes.DeviceSecret) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

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

func (m *MessageKeystore) SealEnvelope(ctx context.Context, g *bertytypes.Group, deviceSK crypto.PrivKey, payload []byte) ([]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	if deviceSK == nil || g == nil || m == nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := m.getDeviceChainKey(deviceSK.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := sealEnvelopeInternal(ctx, payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := m.deriveDeviceSecret(g, deviceSK); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return env, nil
}

func (m *MessageKeystore) deriveDeviceSecret(g *bertytypes.Group, deviceSK crypto.PrivKey) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	if m == nil || deviceSK == nil {
		return errcode.ErrInvalidInput
	}

	ds, err := m.getDeviceChainKey(deviceSK.GetPublic())
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey())
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putDeviceChainKey(deviceSK.GetPublic(), &bertytypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putPrecomputedKey(deviceSK.GetPublic(), ds.Counter+1, &mk); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) updateCurrentKey(pk crypto.PubKey, ds *bertytypes.DeviceSecret) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	currentCK, err := m.getDeviceChainKey(pk)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds.Counter < currentCK.Counter {
		return nil
	}

	if err = m.putDeviceChainKey(pk, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
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
