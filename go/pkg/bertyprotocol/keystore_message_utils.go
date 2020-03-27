package bertyprotocol

import (
	"context"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/golang/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/nacl/secretbox"
)

func openPayload(ctx context.Context, m *MessageKeystore, id cid.Cid, payload []byte, headers *bertytypes.MessageHeaders) ([]byte, *decryptInfo, error) {
	var (
		err error
		di  = &decryptInfo{
			Cid:            id,
			NewlyDecrypted: true,
		}
	)

	if di.MK, err = m.GetKeyForCID(ctx, id); err == nil {
		di.NewlyDecrypted = false
	} else {
		pk, err := crypto.UnmarshalEd25519PublicKey(headers.DevicePK)
		if err != nil {
			return nil, nil, errcode.ErrDeserialization.Wrap(err)
		}

		di.MK, err = m.GetPrecomputedKey(ctx, pk, headers.Counter)
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

func updateCurrentKey(ctx context.Context, m *MessageKeystore, pk crypto.PubKey, ds *bertytypes.DeviceSecret) error {
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

func sealPayload(payload []byte, ds *bertytypes.DeviceSecret, deviceSK crypto.PrivKey, g *bertytypes.Group) ([]byte, []byte, error) {
	var (
		msgKey [32]byte
		err    error
	)

	sig, err := deviceSK.Sign(payload)
	if err != nil {
		return nil, nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	if _, msgKey, err = deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey()); err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return secretbox.Seal(nil, payload, uint64AsNonce(ds.Counter+1), &msgKey), sig, nil
}

func sealEnvelopeInternal(payload []byte, ds *bertytypes.DeviceSecret, deviceSK crypto.PrivKey, g *bertytypes.Group) ([]byte, error) {
	encryptedPayload, sig, err := sealPayload(payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	devicePKRaw, err := deviceSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	headers, err := proto.Marshal(&bertytypes.MessageHeaders{
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

	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	encryptedHeaders := secretbox.Seal(nil, headers, nonce, sk)

	env, err := proto.Marshal(&bertytypes.MessageEnvelope{
		MessageHeaders: encryptedHeaders,
		Message:        encryptedPayload,
		Nonce:          nonce[:],
	})
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return env, nil
}

func sealEnvelope(ctx context.Context, mkh *MessageKeystore, g *bertytypes.Group, deviceSK crypto.PrivKey, payload []byte) ([]byte, error) {
	if deviceSK == nil || g == nil || mkh == nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := mkh.GetDeviceChainKey(ctx, deviceSK.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := sealEnvelopeInternal(payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := deriveDeviceSecret(ctx, mkh, g, deviceSK); err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return env, nil
}

func deriveDeviceSecret(ctx context.Context, mkh *MessageKeystore, g *bertytypes.Group, deviceSK crypto.PrivKey) error {
	if mkh == nil || deviceSK == nil {
		return errcode.ErrInvalidInput
	}

	ds, err := mkh.GetDeviceChainKey(ctx, deviceSK.GetPublic())
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey())
	if err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = mkh.PutDeviceChainKey(ctx, deviceSK.GetPublic(), &bertytypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err = mkh.PutPrecomputedKey(ctx, deviceSK.GetPublic(), ds.Counter+1, &mk); err != nil {
		return errcode.ErrMessageKeyPersistencePut.Wrap(err)
	}

	return nil
}

type decryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func openEnvelope(ctx context.Context, m *MessageKeystore, g *bertytypes.Group, data []byte, id cid.Cid) (*bertytypes.MessageHeaders, []byte, *decryptInfo, error) {
	if m == nil || g == nil {
		return nil, nil, nil, errcode.ErrInvalidInput
	}

	env, headers, err := openEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, decryptInfo, err := openPayload(ctx, m, id, env.Message, headers)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return headers, msg, decryptInfo, nil
}

func openEnvelopeHeaders(data []byte, g *bertytypes.Group) (*bertytypes.MessageEnvelope, *bertytypes.MessageHeaders, error) {
	env := &bertytypes.MessageEnvelope{}
	err := env.Unmarshal(data)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	sk, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := cryptoutil.NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	headersBytes, ok := secretbox.Open(nil, env.MessageHeaders, nonce, sk)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt
	}

	headers := &bertytypes.MessageHeaders{}
	if err := headers.Unmarshal(headersBytes); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	return env, headers, nil
}

func postDecryptActions(ctx context.Context, m *MessageKeystore, di *decryptInfo, g *bertytypes.Group, ownPK crypto.PubKey, headers *bertytypes.MessageHeaders) error {
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

	if err = m.PutKeyForCID(ctx, di.Cid, di.MK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err = m.DelPrecomputedKey(ctx, pk, headers.Counter); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if ds, err = m.GetDeviceChainKey(ctx, pk); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if ds, err = preComputeKeys(ctx, m, pk, g, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// If the message was not emitted by the current device we might need
	// to update the current chain key
	if ownPK == nil || !ownPK.Equals(pk) {
		if err = updateCurrentKey(ctx, m, pk, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}

func deriveNextKeys(ck []byte, salt []byte, groupID []byte) ([]byte, [32]byte, error) {
	var (
		nextMsg [32]byte
		err     error
	)

	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	// Generate Pseudo Random Key using ck as IKM and salt
	prk := hkdf.Extract(hash, ck, salt)
	if len(prk) == 0 {
		return nil, nextMsg, errcode.ErrInternal
	}

	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, groupID)

	// Generate next KDF and message keys
	nextCK, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nextMsg, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	nextMsgSlice, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nextMsg, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	for i, b := range nextMsgSlice {
		nextMsg[i] = b
	}

	return nextCK, nextMsg, nil
}

func preComputeKeys(ctx context.Context, m *MessageKeystore, device crypto.PubKey, g *bertytypes.Group, ds *bertytypes.DeviceSecret) (*bertytypes.DeviceSecret, error) {
	ck := ds.ChainKey
	counter := ds.Counter

	knownCK, err := m.GetDeviceChainKey(ctx, device)
	if err != nil && err != errcode.ErrMissingInput {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	for i := 1; i <= m.GetPrecomputedKeyExpectedCount(); i++ {
		counter++

		knownMK, err := m.GetPrecomputedKey(ctx, device, counter)
		if err != nil && err != errcode.ErrMissingInput {
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

		err = m.PutPrecomputedKey(ctx, device, counter, &mk)
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

func getDeviceSecret(ctx context.Context, g *bertytypes.Group, mk *MessageKeystore, acc DeviceKeystore) (*bertytypes.DeviceSecret, error) {
	md, err := acc.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ds, err := mk.GetDeviceChainKey(ctx, md.device.GetPublic())

	if err != nil && err == errcode.ErrMissingInput {
		// If secret does not exist, create it
		ds, err := newDeviceSecret()
		if err != nil {
			return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		if err = registerChainKey(ctx, mk, g, md.device.GetPublic(), ds, true); err != nil {
			return nil, errcode.ErrMessageKeyPersistencePut.Wrap(err)
		}

		return ds, nil
	} else if err != nil {
		return nil, errcode.ErrMessageKeyPersistenceGet.Wrap(err)
	}

	return ds, nil
}

func registerChainKey(ctx context.Context, mk *MessageKeystore, g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	var err error

	if _, err := mk.GetDeviceChainKey(ctx, devicePK); err == nil {
		// device is already registered, ignore it
		return nil
	}

	// If own device store key as is, no need to precompute future keys
	if isOwnPK {
		if err := mk.PutDeviceChainKey(ctx, devicePK, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = preComputeKeys(ctx, mk, devicePK, g, ds); err != nil {
		return errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	if err := mk.PutDeviceChainKey(ctx, devicePK, ds); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	return nil
}

func idForCachedKey(pk []byte, counter uint64) datastore.Key {
	return datastore.KeyWithNamespaces([]string{"cachedCKs", hex.EncodeToString(pk), fmt.Sprintf("%d", counter)})
}

func idForCurrentCK(pk []byte) datastore.Key {
	return datastore.KeyWithNamespaces([]string{"currentCKs", hex.EncodeToString(pk)})
}

func idForCID(id cid.Cid) datastore.Key {
	// TODO: specify the id
	return datastore.KeyWithNamespaces([]string{"cid", id.String()})
}

func uint64AsNonce(val uint64) *[24]byte {
	var nonce [24]byte

	binary.BigEndian.PutUint64(nonce[:], val)

	return &nonce
}
