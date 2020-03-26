package bertyprotocol

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/golang/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	datastore "github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/nacl/secretbox"
)

func OpenPayload(ctx context.Context, m MessageKeys, id cid.Cid, payload []byte, headers *bertytypes.MessageHeaders) ([]byte, *DecryptInfo, error) {
	var (
		err error
		di  = &DecryptInfo{
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

func updateCurrentKey(ctx context.Context, m MessageKeys, pk crypto.PubKey, ds *bertytypes.DeviceSecret) error {
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

func SealPayload(payload []byte, ds *bertytypes.DeviceSecret, deviceSK crypto.PrivKey, g *bertytypes.Group) ([]byte, []byte, error) {
	var (
		msgKey [32]byte
		err    error
	)

	sig, err := deviceSK.Sign(payload)
	if err != nil {
		return nil, nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	if _, msgKey, err = deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey()); err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return secretbox.Seal(nil, payload, uint64AsNonce(ds.Counter+1), &msgKey), sig, nil
}

func SealEnvelopeInternal(payload []byte, ds *bertytypes.DeviceSecret, deviceSK crypto.PrivKey, g *bertytypes.Group) ([]byte, error) {
	encryptedPayload, sig, err := SealPayload(payload, ds, deviceSK, g)
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

	nonce, nonceSlice, err := generateNonce()
	if err != nil {
		return nil, errcode.ErrRandomGenerationFailed.Wrap(err)
	}

	encryptedHeaders := secretbox.Seal(nil, headers, nonce, sk)

	env, err := proto.Marshal(&bertytypes.MessageEnvelope{
		MessageHeaders: encryptedHeaders,
		Message:        encryptedPayload,
		Nonce:          nonceSlice,
	})
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return env, nil
}

func SealEnvelope(ctx context.Context, mkh MessageKeys, g *bertytypes.Group, deviceSK crypto.PrivKey, payload []byte) ([]byte, error) {
	if deviceSK == nil || g == nil || mkh == nil {
		return nil, errcode.ErrInvalidInput
	}

	ds, err := mkh.GetDeviceChainKey(ctx, deviceSK.GetPublic())
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := SealEnvelopeInternal(payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := DeriveDeviceSecret(ctx, mkh, g, deviceSK); err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return env, nil
}

func DeriveDeviceSecret(ctx context.Context, mkh MessageKeys, g *bertytypes.Group, deviceSK crypto.PrivKey) error {
	if mkh == nil || deviceSK == nil {
		return errcode.ErrInvalidInput
	}

	ds, err := mkh.GetDeviceChainKey(ctx, deviceSK.GetPublic())
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	ck, mk, err := deriveNextKeys(ds.ChainKey, nil, g.GetPublicKey())
	if err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	if err = mkh.PutDeviceChainKey(ctx, deviceSK.GetPublic(), &bertytypes.DeviceSecret{
		ChainKey: ck,
		Counter:  ds.Counter + 1,
	}); err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	if err = mkh.PutPrecomputedKey(ctx, deviceSK.GetPublic(), ds.Counter+1, &mk); err != nil {
		return errcode.ErrPersistencePut.Wrap(err)
	}

	return nil
}

type DecryptInfo struct {
	NewlyDecrypted bool
	MK             *[32]byte
	Cid            cid.Cid
}

func OpenEnvelope(ctx context.Context, m MessageKeys, g *bertytypes.Group, data []byte, id cid.Cid) (*bertytypes.MessageHeaders, []byte, *DecryptInfo, error) {
	if m == nil || g == nil {
		return nil, nil, nil, errcode.ErrInvalidInput
	}

	env, headers, err := OpenEnvelopeHeaders(data, g)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg, decryptInfo, err := OpenPayload(ctx, m, id, env.Message, headers)
	if err != nil {
		return nil, nil, nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return headers, msg, decryptInfo, nil
}

func OpenEnvelopeHeaders(data []byte, g *bertytypes.Group) (*bertytypes.MessageEnvelope, *bertytypes.MessageHeaders, error) {
	env := &bertytypes.MessageEnvelope{}
	err := env.Unmarshal(data)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	sk, err := g.GetSharedSecret()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := nonceAsArr(env.Nonce)
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

func nonceAsArr(nonceSl []byte) (*[24]byte, error) {
	out := [24]byte{}

	if len(nonceSl) != 24 {
		return &out, errcode.ErrInvalidInput
	}

	for i, b := range nonceSl {
		out[i] = b
	}

	return &out, nil
}

func PostDecryptActions(ctx context.Context, m MessageKeys, di *DecryptInfo, g *bertytypes.Group, ownPK crypto.PubKey, headers *bertytypes.MessageHeaders) error {
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

	if ds, err = PreComputeKeys(ctx, m, pk, g, ds); err != nil {
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

func PreComputeKeys(ctx context.Context, m MessageKeys, device crypto.PubKey, g *bertytypes.Group, ds *bertytypes.DeviceSecret) (*bertytypes.DeviceSecret, error) {
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

func GetDeviceSecret(ctx context.Context, g *bertytypes.Group, mk MessageKeys, acc AccountKeys) (*bertytypes.DeviceSecret, error) {
	md, err := acc.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ds, err := mk.GetDeviceChainKey(ctx, md.Device.GetPublic())

	if err != nil && err == errcode.ErrMissingInput {
		// If secret does not exist, create it
		ds, err := NewDeviceSecret()
		if err != nil {
			return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
		}

		if err = RegisterChainKey(ctx, mk, g, md.Device.GetPublic(), ds, true); err != nil {
			return nil, errcode.ErrPersistencePut.Wrap(err)
		}

		return ds, nil

	} else if err != nil {
		return nil, errcode.ErrPersistenceGet.Wrap(err)
	}

	return ds, nil
}

func RegisterChainKey(ctx context.Context, mk MessageKeys, g *bertytypes.Group, devicePK crypto.PubKey, ds *bertytypes.DeviceSecret, isOwnPK bool) error {
	var err error

	if _, err := mk.GetDeviceChainKey(ctx, devicePK); err == nil {
		// Device is already registered, ignore it
		return nil
	}

	// If own device store key as is, no need to precompute future keys
	if isOwnPK {
		if err := mk.PutDeviceChainKey(ctx, devicePK, ds); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	if ds, err = PreComputeKeys(ctx, mk, devicePK, g, ds); err != nil {
		return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
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
	nonce := make([]byte, 24)
	nonceArr := [24]byte{}
	binary.BigEndian.PutUint64(nonce, val)
	for i := range nonce {
		nonceArr[i] = nonce[i]
	}

	return &nonceArr
}

func to32ByteArray(key []byte) *[32]byte {
	keyArr := [32]byte{}
	for i, c := range key {
		keyArr[i] = c
	}

	return &keyArr
}

func from32ByteArray(key *[32]byte) []byte {
	keySl := make([]byte, 32)
	for i, c := range key {
		keySl[i] = c
	}

	return keySl
}
