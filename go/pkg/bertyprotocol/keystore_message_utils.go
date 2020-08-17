package bertyprotocol

import (
	"context"
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

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

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

func sealEnvelopeInternal(ctx context.Context, payload []byte, ds *bertytypes.DeviceSecret, deviceSK crypto.PrivKey, g *bertytypes.Group) ([]byte, error) {
	encryptedPayload, sig, err := sealPayload(payload, ds, deviceSK, g)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	devicePKRaw, err := deviceSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	h := &bertytypes.MessageHeaders{
		Counter:  ds.Counter + 1,
		DevicePK: devicePKRaw,
		Sig:      sig,
	}

	tracer.InjectSpanContextToMessageHeaders(ctx, h)

	headers, err := proto.Marshal(h)
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
		return nil, nil, errcode.ErrCryptoDecrypt.Wrap(fmt.Errorf("secretbox failed to open headers"))
	}

	headers := &bertytypes.MessageHeaders{}
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
