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
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type messageKeystore struct {
	lock                 sync.Mutex
	preComputedKeysCount int
	store                *dssync.MutexDatastore
}

type decryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func (m *messageKeystore) getDeviceChainKey(groupPK, pk crypto.PubKey) (*protocoltypes.DeviceSecret, error) {
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

	ds := &protocoltypes.DeviceSecret{}
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

func (m *messageKeystore) postDecryptActions(di *decryptInfo, g *protocoltypes.Group, ownPK crypto.PubKey, headers *protocoltypes.MessageHeaders) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	// Message was newly decrypted, we can save the message key and derive
	// future keys if necessary.
	if di == nil || !di.NewlyDecrypted {
		return nil
	}

	var (
		ds  *protocoltypes.DeviceSecret
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

	if ds, err = m.preComputeKeys(pk, groupPK, ds); err != nil {
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

func (m *messageKeystore) GetDeviceSecret(g *protocoltypes.Group, acc DeviceKeystore) (*protocoltypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

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

func (m *messageKeystore) RegisterChainKey(g *protocoltypes.Group, devicePK crypto.PubKey, ds *protocoltypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	return m.registerChainKey(g, devicePK, ds, isOwnPK)
}

func (m *messageKeystore) registerChainKey(g *protocoltypes.Group, devicePK crypto.PubKey, ds *protocoltypes.DeviceSecret, isOwnPK bool) error {
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

	if ds, err = m.preComputeKeys(devicePK, groupPK, ds); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err := m.putDeviceChainKey(groupPK, devicePK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) preComputeKeys(device crypto.PubKey, groupPK crypto.PubKey, ds *protocoltypes.DeviceSecret) (*protocoltypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	ck := ds.ChainKey
	counter := ds.Counter

	groupPKBytes, err := groupPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	knownCK, err := m.getDeviceChainKey(groupPK, device)
	if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	preComputedKeys := []computedKey{}
	for i := 0; i < m.getPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownMK, err := m.getPrecomputedKey(groupPK, device, counter)
		if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
			return nil, errcode.ErrInternal.Wrap(err)
		}

		// TODO: Salt?
		newCK, mk, err := deriveNextKeys(ck, nil, groupPKBytes)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		ck = newCK

		if knownMK != nil && knownCK != nil {
			if knownCK.Counter != counter-1 {
				continue
			}
		}

		preComputedKeys = append(preComputedKeys, computedKey{counter, &mk})
	}

	err = m.putPrecomputedKeys(groupPK, device, preComputedKeys...)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &protocoltypes.DeviceSecret{
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

type computedKey struct {
	counter uint64
	mk      *[32]byte
}

func (m *messageKeystore) putPrecomputedKeys(groupPK, device crypto.PubKey, preComputedKeys ...computedKey) error {
	if m == nil || len(preComputedKeys) == 0 {
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

	batch, err := m.store.Batch()
	if err == datastore.ErrBatchUnsupported {
		for _, preComputedKey := range preComputedKeys {
			id := idForCachedKey(groupRaw, deviceRaw, preComputedKey.counter)

			if err := m.store.Put(id, preComputedKey.mk[:]); err != nil {
				return errcode.ErrMessageKeyPersistencePut.Wrap(err)
			}
		}

		return nil
	} else if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	for _, preComputedKey := range preComputedKeys {
		id := idForCachedKey(groupRaw, deviceRaw, preComputedKey.counter)

		if err := batch.Put(id, preComputedKey.mk[:]); err != nil {
			return errcode.ErrMessageKeyPersistencePut.Wrap(err)
		}
	}

	if err := batch.Commit(); err != nil {
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

func (m *messageKeystore) OpenEnvelope(ctx context.Context, g *protocoltypes.Group, ownPK crypto.PubKey, data []byte, id cid.Cid) (*protocoltypes.MessageHeaders, *protocoltypes.EncryptedMessage, [][]byte, error) {
	if m == nil || g == nil {
		return nil, nil, nil, errcode.ErrInvalidInput
	}

	gPK, err := g.GetPubKey()
	if err != nil {
		return nil, nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	env, headers, err := openEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msgBytes, decryptInfo, err := m.openPayload(id, gPK, env.Message, headers)
	if err != nil {
		return headers, nil, nil, errcode.ErrCryptoDecryptPayload.Wrap(err)
	}

	if err := m.postDecryptActions(decryptInfo, g, ownPK, headers); err != nil {
		return nil, nil, nil, errcode.TODO.Wrap(err)
	}

	var msg protocoltypes.EncryptedMessage
	err = msg.Unmarshal(msgBytes)
	if err != nil {
		return nil, nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	attachmentsCIDs, err := attachmentCIDSliceDecrypt(g, env.GetEncryptedAttachmentCIDs())
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return headers, &msg, attachmentsCIDs, nil
}

func (m *messageKeystore) openPayload(id cid.Cid, groupPK crypto.PubKey, payload []byte, headers *protocoltypes.MessageHeaders) ([]byte, *decryptInfo, error) {
	if m == nil {
		return nil, nil, errcode.ErrInvalidInput
	}

	var (
		err error
		di  = &decryptInfo{
			Cid:            id,
			NewlyDecrypted: true,
		}
		pk crypto.PubKey
	)

	if di.MK, err = m.getKeyForCID(id); err == nil {
		di.NewlyDecrypted = false
	} else {
		pk, err = crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
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

	if di.NewlyDecrypted {
		if ok, err := pk.Verify(msg, headers.Sig); !ok {
			return nil, nil, errcode.ErrCryptoSignatureVerification.Wrap(fmt.Errorf("unable to verify message signature"))
		} else if err != nil {
			return nil, nil, errcode.ErrCryptoSignatureVerification.Wrap(err)
		}
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

func (m *messageKeystore) putDeviceChainKey(groupPK, device crypto.PubKey, ds *protocoltypes.DeviceSecret) error {
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

func (m *messageKeystore) SealEnvelope(g *protocoltypes.Group, deviceSK crypto.PrivKey, payload []byte, attachmentsCIDs [][]byte) ([]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	if deviceSK == nil || g == nil || m == nil {
		return nil, errcode.ErrInvalidInput
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	ds, err := m.getDeviceChainKey(groupPK, deviceSK.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := sealEnvelopeInternal(payload, ds, deviceSK, g, attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := m.deriveDeviceSecret(g, deviceSK); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return env, nil
}

func (m *messageKeystore) deriveDeviceSecret(g *protocoltypes.Group, deviceSK crypto.PrivKey) error {
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

	if err = m.putDeviceChainKey(groupPK, deviceSK.GetPublic(), &protocoltypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putPrecomputedKeys(groupPK, deviceSK.GetPublic(), computedKey{ds.Counter + 1, &mk}); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *messageKeystore) updateCurrentKey(groupPK, pk crypto.PubKey, ds *protocoltypes.DeviceSecret) error {
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
		store:                dssync.MutexWrap(s),
	}
}

// nolint:deadcode,unused // newInMemMessageKeystore instantiate a new messageKeystore, useful for testing
func newInMemMessageKeystore() (*messageKeystore, func()) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	return newMessageKeystore(ds), func() { _ = ds.Close() }
}

func (m *messageKeystore) OpenOutOfStoreMessage(envelope *protocoltypes.OutOfStoreMessage, groupPublicKey []byte) ([]byte, error) {
	if m == nil || envelope == nil || len(groupPublicKey) == 0 {
		return nil, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	gPK, err := crypto.UnmarshalEd25519PublicKey(groupPublicKey)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	dPK, err := crypto.UnmarshalEd25519PublicKey(envelope.DevicePK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	clear, _, err := m.openPayload(cid.Undef, gPK, envelope.EncryptedPayload, &protocoltypes.MessageHeaders{
		Counter:  envelope.Counter,
		DevicePK: envelope.DevicePK,
		Sig:      envelope.Sig,
	})
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	if ok, err := dPK.Verify(clear, envelope.Sig); !ok {
		return nil, errcode.ErrCryptoSignatureVerification.Wrap(fmt.Errorf("unable to verify message signature"))
	} else if err != nil {
		return nil, errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	ds, err := m.getDeviceChainKey(gPK, dPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if _, err = m.preComputeKeys(dPK, gPK, ds); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return clear, nil
}
