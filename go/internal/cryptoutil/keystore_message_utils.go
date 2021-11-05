package cryptoutil

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/gogo/protobuf/proto"
	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func SealPayload(payload []byte, ds *protocoltypes.DeviceSecret, deviceSK crypto.PrivKey, g *protocoltypes.Group) ([]byte, []byte, error) {
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

func SealEnvelope(payload []byte, ds *protocoltypes.DeviceSecret, deviceSK crypto.PrivKey, g *protocoltypes.Group, attachmentsCIDs [][]byte) ([]byte, error) {
	encryptedPayload, sig, err := SealPayload(payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	devicePKRaw, err := deviceSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	h := &protocoltypes.MessageHeaders{
		Counter:  ds.Counter + 1,
		DevicePK: devicePKRaw,
		Sig:      sig,
	}

	headers, err := proto.Marshal(h)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	encryptedHeaders := secretbox.Seal(nil, headers, nonce, GetSharedSecret(g))

	encryptedAttachmentsCIDs, err := AttachmentCIDSliceEncrypt(g, attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	env, err := proto.Marshal(&protocoltypes.MessageEnvelope{
		MessageHeaders:          encryptedHeaders,
		Message:                 encryptedPayload,
		Nonce:                   nonce[:],
		EncryptedAttachmentCIDs: encryptedAttachmentsCIDs,
	})
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return env, nil
}

func OpenEnvelopeHeaders(data []byte, g *protocoltypes.Group) (*protocoltypes.MessageEnvelope, *protocoltypes.MessageHeaders, error) {
	env := &protocoltypes.MessageEnvelope{}
	err := env.Unmarshal(data)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	nonce, err := NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	headersBytes, ok := secretbox.Open(nil, env.MessageHeaders, nonce, GetSharedSecret(g))
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(fmt.Errorf("secretbox failed to open headers"))
	}

	headers := &protocoltypes.MessageHeaders{}
	if err := headers.Unmarshal(headersBytes); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	return env, headers, nil
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

func idForCachedKey(groupPK, pk []byte, counter uint64) datastore.Key {
	return datastore.KeyWithNamespaces([]string{"cachedCKs", hex.EncodeToString(groupPK), hex.EncodeToString(pk), fmt.Sprintf("%d", counter)})
}

func idForCurrentCK(groupPK, pk []byte) datastore.Key {
	return datastore.KeyWithNamespaces([]string{"currentCKs", hex.EncodeToString(groupPK), hex.EncodeToString(pk)})
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
