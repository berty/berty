package orbitutil

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"io"
	"io/ioutil"
	"sync"

	"berty.tech/go-orbit-db/events"
	"github.com/golang/protobuf/proto"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func OpenPayload(ctx context.Context, m MessageKeysHolder, id cid.Cid, payload []byte, pk crypto.PubKey, counter uint64) ([]byte, error) {
	var (
		ds                  *bertyprotocol.DeviceSecret
		mk                  *[32]byte
		err                 error
		wasAlreadyDecrypted bool
	)

	if ds, err = m.GetDeviceChainKey(ctx, pk); err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if mk, err = m.GetKeyForCID(ctx, id); err == nil {
		wasAlreadyDecrypted = true
	} else if mk, err = m.GetPrecomputedKey(ctx, pk, counter); err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, ok := secretbox.Open(nil, payload, uint64AsNonce(counter), mk)
	if !ok {
		return nil, errcode.ErrCryptoDecrypt
	}

	// Message was newly decrypted, we can save the message key and derive
	// future keys if necessary.
	if !wasAlreadyDecrypted {
		if err = m.PutKeyForCID(ctx, id, mk); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
		if err = m.DelPrecomputedKey(ctx, pk, counter); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
		if ds, err = preComputeKeys(ctx, m, pk, ds); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}

		// If the message was not emitted by the current device we might need
		// to update the current chain key
		ownSK := m.GetGroupContext().GetDevicePrivKey()
		if ownSK == nil || !ownSK.GetPublic().Equals(pk) {
			if err = updateCurrentKey(ctx, m, pk, ds); err != nil {
				return nil, errcode.ErrInternal.Wrap(err)
			}
		}
	}

	return msg, nil
}

func updateCurrentKey(ctx context.Context, m MessageKeysHolder, pk crypto.PubKey, ds *bertyprotocol.DeviceSecret) error {
	currentCK, err := m.GetDeviceChainKey(ctx, pk)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds.Counter < currentCK.Counter {
		return nil
	}

	if err = m.PutDeviceChainKey(ctx, pk, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func RegisterChainKeyForDevice(ctx context.Context, m MessageKeysHolder, device crypto.PubKey, ds *bertyprotocol.DeviceSecret) error {
	var err error

	if _, err := m.GetDeviceChainKey(ctx, device); err == nil {
		// Device is already registered, ignore it
		return nil
	}

	// If own device store key as is, no need to precompute future keys
	ownSK := m.GetGroupContext().GetDevicePrivKey()
	if ownSK.GetPublic().Equals(device) {
		if err := m.PutDeviceChainKey(ctx, device, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = preComputeKeys(ctx, m, device, ds); err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	if err := m.PutDeviceChainKey(ctx, device, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func ListPublishedSecrets(ctx context.Context, ms MetadataStore) (map[crypto.PubKey]*bertyprotocol.DeviceSecret, error) {
	lock := sync.Mutex{}
	publishedSecrets := map[crypto.PubKey]*bertyprotocol.DeviceSecret{}

	ch := ms.ListEvents(ctx)

	ownSK := ms.GetGroupContext().GetMemberPrivKey()

	for meta := range ch {
		pk, ds, err := group.OpenDeviceSecret(meta.Metadata, ownSK, ms.GetGroupContext().GetGroup())
		if err != nil {
			// TODO: log
			continue
		}

		lock.Lock()
		publishedSecrets[pk] = ds
		lock.Unlock()
	}

	return publishedSecrets, nil
}

func SealPayload(payload []byte, ds *bertyprotocol.DeviceSecret, deviceSK crypto.PrivKey, gPK crypto.PubKey) ([]byte, []byte, error) {
	var (
		msgKey [32]byte
		err    error
	)

	sig, err := deviceSK.Sign(payload)
	if err != nil {
		return nil, nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	groupID, err := gPK.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	if _, msgKey, err = deriveNextKeys(ds.ChainKey, nil, groupID); err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	messageKeySlice := make([]byte, 32)
	for i, c := range msgKey {
		messageKeySlice[i] = c
	}

	return secretbox.Seal(nil, payload, uint64AsNonce(ds.Counter+1), &msgKey), sig, nil
}

func sealEnvelope(payload []byte, ds *bertyprotocol.DeviceSecret, deviceSK crypto.PrivKey, g *group.Group) ([]byte, error) {
	encryptedPayload, sig, err := SealPayload(payload, ds, deviceSK, g.PubKey)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	devicePKRaw, err := deviceSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	headers, err := proto.Marshal(&bertyprotocol.MessageHeaders{
		Counter:  ds.Counter + 1,
		DevicePK: devicePKRaw,
		Sig:      sig,
	})
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	sk, err := g.GetSharedSecret()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, nonceSlice, err := generateNonce()
	if err != nil {
		return nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	encryptedHeaders := secretbox.Seal(nil, headers, nonce, sk)

	env, err := proto.Marshal(&bertyprotocol.MessageEnvelope{
		MessageHeaders: encryptedHeaders,
		Message:        encryptedPayload,
		Nonce:          nonceSlice,
	})
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return env, nil
}

func SealEnvelope(ctx context.Context, payload []byte, mkh MessageKeysHolder) ([]byte, error) {
	if mkh == nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := mkh.GetOwnDeviceChainKey(ctx)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	sk := mkh.GetGroupContext().GetDevicePrivKey()
	g := mkh.GetGroupContext().GetGroup()

	env, err := sealEnvelope(payload, ds, sk, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := DeriveDeviceSecret(ctx, mkh); err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return env, nil
}

func DeriveDeviceSecret(ctx context.Context, mkh MessageKeysHolder) error {
	groupID, err := mkh.GetGroupContext().GetGroup().GroupID()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	ds, err := mkh.GetOwnDeviceChainKey(ctx)
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	dSK := mkh.GetGroupContext().GetDevicePrivKey()

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, groupID)
	if err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	if err = mkh.PutDeviceChainKey(ctx, dSK.GetPublic(), &bertyprotocol.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	if err = mkh.PutPrecomputedKey(ctx, dSK.GetPublic(), ds.Counter+1, &mk); err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

func OpenEnvelope(ctx context.Context, data []byte, id cid.Cid, mkh MessageKeysHolder) (*bertyprotocol.MessageHeaders, []byte, error) {
	g := mkh.GetGroupContext().GetGroup()

	env := &bertyprotocol.MessageEnvelope{}
	err := env.Unmarshal(data)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	sk, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	if len(env.Nonce) != 24 {
		return nil, nil, errcode.ErrInvalidInput
	}

	var nonce [24]byte
	for i, b := range env.Nonce {
		nonce[i] = b
	}

	headersBytes, ok := secretbox.Open(nil, env.MessageHeaders, &nonce, sk)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt
	}

	headers := &bertyprotocol.MessageHeaders{}
	if err := headers.Unmarshal(headersBytes); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	devPK, err := crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	msg, err := OpenPayload(ctx, mkh, id, env.Message, devPK, headers.Counter)
	if err != nil {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return headers, msg, nil
}

func generateNonce() (*[24]byte, []byte, error) {
	var out [24]byte

	outSlice, err := ioutil.ReadAll(io.LimitReader(rand.Reader, 24))
	if err != nil {
		return nil, nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	for i, b := range outSlice {
		out[i] = b
	}

	return &out, outSlice, nil
}

func uint64AsNonce(val uint64) *[24]byte {
	nonce := make([]byte, 24)
	nonceArr := [24]byte{}
	binary.BigEndian.PutUint64(nonce, val)
	for i := range nonce {
		nonceArr[i] = nonce[i]
	}

	return &nonceArr
}

func convertPubKeyToStringID(pk crypto.PubKey) (string, error) {
	dPK, err := pk.Raw()
	if err != nil {
		return "", errcode.ErrSerialization.Wrap(err)
	}

	return hex.EncodeToString(dPK), nil
}

func deriveNextKeys(ck []byte, salt []byte, groupID []byte) ([]byte, [32]byte, error) {
	var (
		nextMsg [32]byte
		err     error
	)

	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	// Generate Pseudo Random Key using ck as IKM and salt
	prk := hkdf.Extract(hash, ck[:], salt[:])
	if len(prk) == 0 {
		return nil, nextMsg, errcode.ErrInternal
	}

	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, groupID)

	// Generate next KDF and message keys
	nextCK, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nextMsg, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	nextMsgSlice, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nextMsg, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	for i, b := range nextMsgSlice {
		nextMsg[i] = b
	}

	return nextCK, nextMsg, nil
}

func preComputeKeys(ctx context.Context, m MessageKeysHolder, device crypto.PubKey, deviceSecret *bertyprotocol.DeviceSecret) (*bertyprotocol.DeviceSecret, error) {
	ck := deviceSecret.ChainKey
	counter := deviceSecret.Counter

	groupID, err := m.GetGroupContext().GetGroup().PubKey.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	for i := 1; i <= m.GetPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownCK, err := m.GetPrecomputedKey(ctx, device, counter)
		if err != nil && err != errcode.ErrMissingInput {
			return nil, errcode.ErrInternal.Wrap(err)
		}

		if knownCK != nil {
			for i, c := range knownCK {
				ck[i] = c
			}
			continue
		}

		// TODO: Salt?
		newCK, mk, err := deriveNextKeys(ck, nil, groupID)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		err = m.PutPrecomputedKey(ctx, device, counter, &mk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		ck = newCK

		if i != 1 {
			continue
		}
	}

	return &bertyprotocol.DeviceSecret{
		Counter:  counter,
		ChainKey: ck,
	}, nil
}

func FillMessageKeysHolderUsingNewData(ctx context.Context, gc GroupContext) error {
	if gc == nil {
		return errcode.ErrInvalidInput
	}

	m := gc.GetMessageKeysHolder()
	ms := gc.GetMetadataStore()

	if m == nil || ms == nil {
		return errcode.ErrInvalidInput
	}

	ms.Subscribe(ctx, func(evt events.Event) {
		e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
		if !ok {
			return
		}

		pk, ds, err := group.OpenDeviceSecret(e.Metadata, gc.GetMemberPrivKey(), ms.GetGroupContext().GetGroup())
		if err != nil {
			return
		}

		if err = RegisterChainKeyForDevice(ctx, m, pk, ds); err != nil {
			// TODO: log
			return
		}
	})

	return nil
}

func FillMessageKeysHolderUsingPreviousData(ctx context.Context, m MessageKeysHolder, ms MetadataStore) error {
	publishedSecrets, err := ListPublishedSecrets(ctx, ms)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for dev, sec := range publishedSecrets {
		if err := RegisterChainKeyForDevice(ctx, m, dev, sec); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}
