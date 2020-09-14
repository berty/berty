package bertyprotocol

import (
	"context"
	"fmt"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type messageKeystore struct {
	lock                 sync.Mutex
	preComputedKeysCount int
	store                datastore.Datastore
}

type decryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func (m *messageKeystore) getDeviceChainKey(groupPK, pk crypto.PubKey) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	pkB, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	groupRaw, err := groupPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	key := idForCurrentCK(groupRaw, pkB)

	dsBytes, err := m.store.Get(key)
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput.Wrap(err)
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

func (m *messageKeystore) delPrecomputedKey(groupPK, device crypto.PubKey, counter uint64) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	groupRaw, err := groupPK.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(groupRaw, deviceRaw, counter)
	if err := m.store.Delete(id); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) postDecryptActions(di *decryptInfo, g *bertytypes.Group, ownPK crypto.PubKey, headers *bertytypes.MessageHeaders) error {
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

	groupPK, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if err = m.putKeyForCID(di.Cid, di.MK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err = m.delPrecomputedKey(groupPK, pk, headers.Counter); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds, err = m.getDeviceChainKey(groupPK, pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ds, err = m.preComputeKeys(pk, g, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// If the message was not emitted by the current device we might need
	// to update the current chain key
	if ownPK == nil || !ownPK.Equals(pk) {
		if err = m.updateCurrentKey(groupPK, pk, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func (m *messageKeystore) GetDeviceSecret(g *bertytypes.Group, acc DeviceKeystore) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	md, err := acc.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	ds, err := m.getDeviceChainKey(groupPK, md.device.GetPublic())

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

func (m *messageKeystore) RegisterChainKey(g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	return m.registerChainKey(g, devicePK, ds, isOwnPK)
}

func (m *messageKeystore) registerChainKey(g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := m.getDeviceChainKey(groupPK, devicePK); err == nil {
		// device is already registered, ignore it
		return nil
	}

	// If own device store key as is, no need to precompute future keys
	if isOwnPK {
		if err := m.putDeviceChainKey(groupPK, devicePK, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = m.preComputeKeys(devicePK, g, ds); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err := m.putDeviceChainKey(groupPK, devicePK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) preComputeKeys(device crypto.PubKey, g *bertytypes.Group, ds *bertytypes.DeviceSecret) (*bertytypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	ck := ds.ChainKey
	counter := ds.Counter

	groupPK, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	knownCK, err := m.getDeviceChainKey(groupPK, device)
	if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	for i := 1; i <= m.getPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownMK, err := m.getPrecomputedKey(groupPK, device, counter)
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

		err = m.putPrecomputedKey(groupPK, device, counter, &mk)
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

func (m *messageKeystore) getPrecomputedKey(groupPK, device crypto.PubKey, counter uint64) (*[32]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	deviceRaw, err := device.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	groupRaw, err := groupPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(groupRaw, deviceRaw, counter)

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

func (m *messageKeystore) putPrecomputedKey(groupPK, device crypto.PubKey, counter uint64, mk *[32]byte) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	groupRaw, err := groupPK.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	id := idForCachedKey(groupRaw, deviceRaw, counter)

	if err := m.store.Put(id, mk[:]); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) putKeyForCID(id cid.Cid, key *[32]byte) error {
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

func (m *messageKeystore) OpenEnvelope(ctx context.Context, g *bertytypes.Group, ownPK crypto.PubKey, data []byte, id cid.Cid) (*bertytypes.MessageHeaders, []byte, error) {
	if m == nil || g == nil {
		return nil, nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	gPK, err := g.GetPubKey()
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	env, headers, err := openEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, decryptInfo, err := m.openPayload(id, gPK, env.Message, headers)
	if err != nil {
		return headers, nil, errcode.ErrCryptoDecryptPayload.Wrap(err)
	}

	if err := m.postDecryptActions(decryptInfo, g, ownPK, headers); err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return headers, msg, nil
}

func (m *messageKeystore) openPayload(id cid.Cid, groupPK crypto.PubKey, payload []byte, headers *bertytypes.MessageHeaders) ([]byte, *decryptInfo, error) {
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

		di.MK, err = m.getPrecomputedKey(groupPK, pk, headers.Counter)
		if err != nil {
			return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
		}
	}

	msg, ok := secretbox.Open(nil, payload, uint64AsNonce(headers.Counter), di.MK)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(fmt.Errorf("secret box failed to open message payload"))
	}

	// Message was newly decrypted, we can save the message key and derive
	// future keys if necessary.
	return msg, di, nil
}

func (m *messageKeystore) getKeyForCID(id cid.Cid) (*[32]byte, error) {
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

func (m *messageKeystore) getPrecomputedKeyExpectedCount() int {
	if m == nil {
		return 0
	}

	return m.preComputedKeysCount
}

func (m *messageKeystore) putDeviceChainKey(groupPK, device crypto.PubKey, ds *bertytypes.DeviceSecret) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	deviceRaw, err := device.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	groupRaw, err := groupPK.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	key := idForCurrentCK(groupRaw, deviceRaw)

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

func (m *messageKeystore) SealEnvelope(ctx context.Context, g *bertytypes.Group, deviceSK crypto.PrivKey, payload []byte) ([]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	if deviceSK == nil || g == nil || m == nil {
		return nil, errcode.ErrInvalidInput
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	ds, err := m.getDeviceChainKey(groupPK, deviceSK.GetPublic())
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

func (m *messageKeystore) deriveDeviceSecret(g *bertytypes.Group, deviceSK crypto.PrivKey) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if m == nil || deviceSK == nil {
		return errcode.ErrInvalidInput
	}

	ds, err := m.getDeviceChainKey(groupPK, deviceSK.GetPublic())
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey())
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putDeviceChainKey(groupPK, deviceSK.GetPublic(), &bertytypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putPrecomputedKey(groupPK, deviceSK.GetPublic(), ds.Counter+1, &mk); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) updateCurrentKey(groupPK, pk crypto.PubKey, ds *bertytypes.DeviceSecret) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	currentCK, err := m.getDeviceChainKey(groupPK, pk)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds.Counter < currentCK.Counter {
		return nil
	}

	if err = m.putDeviceChainKey(groupPK, pk, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

// newMessageKeystore instantiate a new messageKeystore
func newMessageKeystore(s datastore.Datastore) *messageKeystore {
	return &messageKeystore{
		preComputedKeysCount: 100,
		store:                s,
	}
}

// nolint:deadcode,unused // newInMemMessageKeystore instantiate a new messageKeystore, useful for testing
func newInMemMessageKeystore() (*messageKeystore, func()) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	return newMessageKeystore(ds), func() { _ = ds.Close() }
}
