package cryptoutil

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	dssync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const precomputePushRefsCount = 100

type MessageKeystore struct {
	lock                 sync.Mutex
	preComputedKeysCount int
	store                *dssync.MutexDatastore
}

type DecryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func (m *MessageKeystore) GetDeviceChainKey(ctx context.Context, groupPK, pk crypto.PubKey) (*protocoltypes.DeviceSecret, error) {
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

	dsBytes, err := m.store.Get(ctx, key)
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput.Wrap(err)
	} else if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	ds := &protocoltypes.DeviceSecret{}
	if err := ds.Unmarshal(dsBytes); err != nil {
		return nil, errcode.ErrInvalidInput
	}

	return ds, nil
}

func (m *MessageKeystore) HasSecretForRawDevicePK(ctx context.Context, groupPK, devicePK []byte) (has bool) {
	if m == nil {
		return false
	}

	key := idForCurrentCK(groupPK, devicePK)
	has, _ = m.store.Has(ctx, key)
	return
}

func (m *MessageKeystore) delPrecomputedKey(ctx context.Context, groupPK, device crypto.PubKey, counter uint64) error {
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
	if err := m.store.Delete(ctx, id); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) PostDecryptActions(ctx context.Context, di *DecryptInfo, g *protocoltypes.Group, ownPK crypto.PubKey, headers *protocoltypes.MessageHeaders) error {
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

	if err = m.putKeyForCID(ctx, di.Cid, di.MK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err = m.delPrecomputedKey(ctx, groupPK, pk, headers.Counter); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds, err = m.GetDeviceChainKey(ctx, groupPK, pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ds, err = m.preComputeKeys(ctx, pk, groupPK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// If the message was not emitted by the current Device we might need
	// to update the current chain key
	if ownPK == nil || !ownPK.Equals(pk) {
		if err = m.updateCurrentKey(ctx, groupPK, pk, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func (m *MessageKeystore) GetDeviceSecret(ctx context.Context, g *protocoltypes.Group, acc DeviceKeystore) (*protocoltypes.DeviceSecret, error) {
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

	ds, err := m.GetDeviceChainKey(ctx, groupPK, md.device.GetPublic())
	if errcode.Is(err, errcode.ErrMissingInput) {
		// If secret does not exist, create it
		ds, err := NewDeviceSecret()
		if err != nil {
			return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		if err = m.registerChainKey(ctx, g, md.device.GetPublic(), ds, true); err != nil {
			return nil, errcode.ErrMessageKeyPersistencePut.Wrap(err)
		}

		return ds, nil
	}
	if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	return ds, nil
}

func (m *MessageKeystore) RegisterChainKey(ctx context.Context, g *protocoltypes.Group, devicePK crypto.PubKey, ds *protocoltypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	return m.registerChainKey(ctx, g, devicePK, ds, isOwnPK)
}

func (m *MessageKeystore) registerChainKey(ctx context.Context, g *protocoltypes.Group, devicePK crypto.PubKey, ds *protocoltypes.DeviceSecret, isOwnPK bool) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	groupPK, err := g.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if _, err := m.GetDeviceChainKey(ctx, groupPK, devicePK); err == nil {
		// Device is already registered, ignore it
		return nil
	}

	// If own Device store key as is, no need to precompute future keys
	if isOwnPK {
		if err := m.putDeviceChainKey(ctx, groupPK, devicePK, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = m.preComputeKeys(ctx, devicePK, groupPK, ds); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err := m.putDeviceChainKey(ctx, groupPK, devicePK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	devicePKBytes, err := devicePK.Raw()
	if err == nil {
		if err := m.UpdatePushGroupReferences(ctx, devicePKBytes, ds.Counter, g); err != nil {
			// TODO: log
			_ = err
		}
	}

	return nil
}

func (m *MessageKeystore) preComputeKeys(ctx context.Context, device crypto.PubKey, groupPK crypto.PubKey, ds *protocoltypes.DeviceSecret) (*protocoltypes.DeviceSecret, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	ck := ds.ChainKey
	counter := ds.Counter

	groupPKBytes, err := groupPK.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	knownCK, err := m.GetDeviceChainKey(ctx, groupPK, device)
	if err != nil && !errcode.Is(err, errcode.ErrMissingInput) {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	preComputedKeys := []computedKey{}
	for i := 0; i < m.GetPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownMK, err := m.getPrecomputedKey(ctx, groupPK, device, counter)
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

	err = m.putPrecomputedKeys(ctx, groupPK, device, preComputedKeys...)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &protocoltypes.DeviceSecret{
		Counter:  counter,
		ChainKey: ck,
	}, nil
}

func (m *MessageKeystore) getPrecomputedKey(ctx context.Context, groupPK, device crypto.PubKey, counter uint64) (*[32]byte, error) {
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

	key, err := m.store.Get(ctx, id)

	if err == datastore.ErrNotFound {
		return nil, errcode.ErrMissingInput.Wrap(fmt.Errorf("key for message does not exist in datastore"))
	}
	if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	keyArray, err := KeySliceToArray(key)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return keyArray, nil
}

type computedKey struct {
	counter uint64
	mk      *[32]byte
}

func (m *MessageKeystore) putPrecomputedKeys(ctx context.Context, groupPK, device crypto.PubKey, preComputedKeys ...computedKey) error {
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

	batch, err := m.store.Batch(ctx)
	if err == datastore.ErrBatchUnsupported {
		for _, preComputedKey := range preComputedKeys {
			id := idForCachedKey(groupRaw, deviceRaw, preComputedKey.counter)

			if err := m.store.Put(ctx, id, preComputedKey.mk[:]); err != nil {
				return errcode.ErrMessageKeyPersistencePut.Wrap(err)
			}
		}

		return nil
	} else if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	for _, preComputedKey := range preComputedKeys {
		id := idForCachedKey(groupRaw, deviceRaw, preComputedKey.counter)

		if err := batch.Put(ctx, id, preComputedKey.mk[:]); err != nil {
			return errcode.ErrMessageKeyPersistencePut.Wrap(err)
		}
	}

	if err := batch.Commit(ctx); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) putKeyForCID(ctx context.Context, id cid.Cid, key *[32]byte) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	if !id.Defined() {
		return nil
	}

	err := m.store.Put(ctx, idForCID(id), key[:])
	if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) OpenEnvelopePayload(
	ctx context.Context,
	env *protocoltypes.MessageEnvelope,
	headers *protocoltypes.MessageHeaders,
	g *protocoltypes.Group,
	ownPK crypto.PubKey,
	id cid.Cid,
) (*protocoltypes.EncryptedMessage, [][]byte, error) {
	gPK, err := g.GetPubKey()
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	msgBytes, decryptInfo, err := m.OpenPayload(ctx, id, gPK, env.Message, headers)
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecryptPayload.Wrap(err)
	}

	if err := m.PostDecryptActions(ctx, decryptInfo, g, ownPK, headers); err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	var msg protocoltypes.EncryptedMessage
	err = msg.Unmarshal(msgBytes)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	attachmentsCIDs, err := AttachmentCIDSliceDecrypt(g, env.GetEncryptedAttachmentCIDs())
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return &msg, attachmentsCIDs, nil
}

func (m *MessageKeystore) OpenEnvelope(
	ctx context.Context,
	g *protocoltypes.Group,
	ownPK crypto.PubKey,
	data []byte, id cid.Cid,
) (*protocoltypes.MessageHeaders, *protocoltypes.EncryptedMessage, [][]byte, error) {
	if m == nil || g == nil {
		return nil, nil, nil, errcode.ErrInvalidInput
	}

	env, headers, err := OpenEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, attachmentsCIDs, err := m.OpenEnvelopePayload(ctx, env, headers, g, ownPK, id)
	if err != nil {
		return nil, nil, nil, errcode.TODO.Wrap(err)
	}

	return headers, msg, attachmentsCIDs, nil
}

func (m *MessageKeystore) OpenPayload(ctx context.Context, id cid.Cid, groupPK crypto.PubKey, payload []byte, headers *protocoltypes.MessageHeaders) ([]byte, *DecryptInfo, error) {
	if m == nil {
		return nil, nil, errcode.ErrInvalidInput
	}

	var (
		err error
		di  = &DecryptInfo{
			Cid:            id,
			NewlyDecrypted: true,
		}
		pk crypto.PubKey
	)

	if di.MK, err = m.GetKeyForCID(ctx, id); err == nil {
		di.NewlyDecrypted = false
	} else {
		pk, err = crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
		if err != nil {
			return nil, nil, errcode.ErrDeserialization.Wrap(err)
		}

		di.MK, err = m.getPrecomputedKey(ctx, groupPK, pk, headers.Counter)
		if err != nil {
			return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
		}
	}

	return m.openPayload(di, pk, payload, headers)
}

func (m *MessageKeystore) openPayload(di *DecryptInfo, pk crypto.PubKey, payload []byte, headers *protocoltypes.MessageHeaders) ([]byte, *DecryptInfo, error) {
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

func (m *MessageKeystore) GetKeyForCID(ctx context.Context, id cid.Cid) (*[32]byte, error) {
	if m == nil {
		return nil, errcode.ErrInvalidInput
	}

	if !id.Defined() {
		return nil, errcode.ErrInvalidInput
	}

	key, err := m.store.Get(ctx, idForCID(id))
	if err == datastore.ErrNotFound {
		return nil, errcode.ErrInvalidInput
	}

	keyArray, err := KeySliceToArray(key)
	if err != nil {
		return nil, errcode.ErrSerialization
	}

	return keyArray, nil
}

func (m *MessageKeystore) GetPrecomputedKeyExpectedCount() int {
	if m == nil {
		return 0
	}

	return m.preComputedKeysCount
}

func (m *MessageKeystore) putDeviceChainKey(ctx context.Context, groupPK, device crypto.PubKey, ds *protocoltypes.DeviceSecret) error {
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

	err = m.store.Put(ctx, key, data)
	if err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) SealEnvelope(ctx context.Context, g *protocoltypes.Group, deviceSK crypto.PrivKey, payload []byte, attachmentsCIDs [][]byte) ([]byte, error) {
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

	ds, err := m.GetDeviceChainKey(ctx, groupPK, deviceSK.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to get device chainkey: %w", err))
	}

	env, err := SealEnvelope(payload, ds, deviceSK, g, attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(fmt.Errorf("unable to seal envelope: %w", err))
	}

	if err := m.DeriveDeviceSecret(ctx, g, deviceSK); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return env, nil
}

func (m *MessageKeystore) DeriveDeviceSecret(ctx context.Context, g *protocoltypes.Group, deviceSK crypto.PrivKey) error {
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

	ds, err := m.GetDeviceChainKey(ctx, groupPK, deviceSK.GetPublic())
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey())
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putDeviceChainKey(ctx, groupPK, deviceSK.GetPublic(), &protocoltypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = m.putPrecomputedKeys(ctx, groupPK, deviceSK.GetPublic(), computedKey{ds.Counter + 1, &mk}); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

func (m *MessageKeystore) updateCurrentKey(ctx context.Context, groupPK, pk crypto.PubKey, ds *protocoltypes.DeviceSecret) error {
	if m == nil {
		return errcode.ErrInvalidInput
	}

	currentCK, err := m.GetDeviceChainKey(ctx, groupPK, pk)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds.Counter < currentCK.Counter {
		return nil
	}

	if err = m.putDeviceChainKey(ctx, groupPK, pk, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

// NewMessageKeystore instantiate a new MessageKeystore
func NewMessageKeystore(s datastore.Datastore) *MessageKeystore {
	return &MessageKeystore{
		preComputedKeysCount: 100,
		store:                dssync.MutexWrap(s),
	}
}

// nolint:deadcode,unused // NewInMemMessageKeystore instantiate a new MessageKeystore, useful for testing
func NewInMemMessageKeystore() (*MessageKeystore, func()) {
	ds := dssync.MutexWrap(datastore.NewMapDatastore())

	return NewMessageKeystore(ds), func() { _ = ds.Close() }
}

func (m *MessageKeystore) OpenOutOfStoreMessage(ctx context.Context, envelope *protocoltypes.OutOfStoreMessage, groupPublicKey []byte) ([]byte, bool, error) {
	if m == nil || envelope == nil || len(groupPublicKey) == 0 {
		return nil, false, errcode.ErrInvalidInput
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	gPK, err := crypto.UnmarshalEd25519PublicKey(groupPublicKey)
	if err != nil {
		return nil, false, errcode.ErrDeserialization.Wrap(err)
	}

	dPK, err := crypto.UnmarshalEd25519PublicKey(envelope.DevicePK)
	if err != nil {
		return nil, false, errcode.ErrDeserialization.Wrap(err)
	}

	_, c, err := cid.CidFromBytes(envelope.CID)
	if err != nil {
		return nil, false, errcode.ErrDeserialization.Wrap(err)
	}

	di := &DecryptInfo{NewlyDecrypted: true}
	if di.MK, err = m.GetKeyForCID(ctx, c); err == nil {
		di.NewlyDecrypted = false
	} else {
		di.MK, err = m.getPrecomputedKey(ctx, gPK, dPK, envelope.Counter)
		if err != nil {
			return nil, false, errcode.ErrCryptoDecrypt.Wrap(err)
		}
	}

	clear, di, err := m.openPayload(di, dPK, envelope.EncryptedPayload, &protocoltypes.MessageHeaders{
		Counter:  envelope.Counter,
		DevicePK: envelope.DevicePK,
		Sig:      envelope.Sig,
	})
	if err != nil {
		return nil, false, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	if ok, err := dPK.Verify(clear, envelope.Sig); !ok {
		return nil, false, errcode.ErrCryptoSignatureVerification.Wrap(fmt.Errorf("unable to verify message signature"))
	} else if err != nil {
		return nil, false, errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	ds, err := m.GetDeviceChainKey(ctx, gPK, dPK)
	if err != nil {
		return nil, false, errcode.ErrInvalidInput.Wrap(err)
	}

	if _, err = m.preComputeKeys(ctx, dPK, gPK, ds); err != nil {
		return nil, false, errcode.ErrInternal.Wrap(err)
	}

	return clear, di.NewlyDecrypted, nil
}

func (m *MessageKeystore) refKey(ref []byte) datastore.Key {
	return datastore.KeyWithNamespaces([]string{
		"push-refs", base64.RawURLEncoding.EncodeToString(ref),
	})
}

func (m *MessageKeystore) refFirstLastKey(groupPK, devicePK []byte) datastore.Key {
	return datastore.KeyWithNamespaces([]string{
		"push-refs",
		base64.RawURLEncoding.EncodeToString(groupPK),
		base64.RawURLEncoding.EncodeToString(devicePK),
	})
}

func (m *MessageKeystore) GetByPushGroupReference(ctx context.Context, ref []byte) ([]byte, error) {
	return m.store.Get(ctx, m.refKey(ref))
}

func (m *MessageKeystore) UpdatePushGroupReferences(ctx context.Context, devicePK []byte, first uint64, group GroupWithSecret) error {
	refsExisting := []uint64(nil)
	refsToCreate := []uint64(nil)

	groupPushSecret, err := GetGroupPushSecret(group)
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	currentFirst, currentLast, err := m.firstLastCachedGroupRefsForMember(ctx, devicePK, group)
	if err == nil {
		for i := currentFirst; i != currentLast; i++ {
			refsExisting = append(refsExisting, i)
		}
	}

	// keep previous refs
	last := first + precomputePushRefsCount
	first -= precomputePushRefsCount
	for i := first; i != last; i++ {
		found := false

		// Ignore refs that should be kept
		for j := 0; j < len(refsExisting); j++ {
			if refsExisting[j] == i {
				refsExisting[j] = refsExisting[len(refsExisting)-1]
				refsExisting = refsExisting[:len(refsExisting)-1]
				found = true
				break
			}
		}

		if !found {
			refsToCreate = append(refsToCreate, i)
		}
	}

	// Remove useless old refs
	for i := 0; i < len(refsExisting); i++ {
		ref, err := CreatePushGroupReference(devicePK, refsExisting[i], groupPushSecret)
		if err != nil {
			// TODO: log
			continue
		}

		if err := m.store.Delete(ctx, m.refKey(ref)); err != nil {
			// TODO: log
			continue
		}
	}

	// Add new refs
	for i := 0; i < len(refsToCreate); i++ {
		ref, err := CreatePushGroupReference(devicePK, refsToCreate[i], groupPushSecret)
		if err != nil {
			// TODO: log
			continue
		}

		if err := m.store.Put(ctx, m.refKey(ref), group.GetPublicKey()); err != nil {
			// TODO: log
			continue
		}
	}

	return nil
}

func (m *MessageKeystore) firstLastCachedGroupRefsForMember(ctx context.Context, devicePK []byte, group GroupWithSecret) (uint64, uint64, error) {
	key := m.refFirstLastKey(group.GetPublicKey(), devicePK)
	bytes, err := m.store.Get(ctx, key)
	if err != nil {
		return 0, 0, err
	}

	ret := protocoltypes.FirstLastCounters{}
	if err := ret.Unmarshal(bytes); err != nil {
		return 0, 0, err
	}

	return ret.First, ret.Last, nil
}
