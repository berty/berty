package group

import (
	"berty.tech/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"
)

type ClearPayload interface {
	proto.Marshaler
	proto.Unmarshaler

	CheckStructure() error
	GetSignerPubKey() (crypto.PubKey, error)
}

// OpenStorePayload opens a symmetric encrypted group payload, type is defined
// by the "out" type
func OpenStorePayload(out ClearPayload, envelopeBytes []byte, g *Group) error {
	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	env := &StoreEncryptedEntry{}
	if err := env.Unmarshal(envelopeBytes); err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	if len(env.Signature) < 24 {
		return errcode.ErrInvalidInput
	}

	var nonce [24]byte
	copy(nonce[:], env.Signature[:24])

	data, ok := secretbox.Open(nil, env.EncryptedPayload, &nonce, sharedSecret)
	if !ok {
		return errcode.ErrGroupMemberLogEventOpen
	}

	err = out.Unmarshal(data)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	err = out.CheckStructure()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	signerPubKey, err := out.GetSignerPubKey()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	ok, err = signerPubKey.Verify(data, env.Signature)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !ok {
		return errcode.ErrGroupMemberLogEventSignature
	}

	return nil
}

func SealStorePayload(payload proto.Marshaler, g *Group, devicePrivateKey crypto.PrivKey) ([]byte, error) {
	payloadBytes, err := payload.Marshal()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signature, err := devicePrivateKey.Sign(payloadBytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	var nonce [24]byte
	copy(nonce[:], signature)

	sharedSecret, err := g.GetSharedSecret()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	data := secretbox.Seal(nil, payloadBytes, &nonce, sharedSecret)

	env := &StoreEncryptedEntry{
		EncryptedPayload: data,
		Signature:        signature,
	}

	return env.Marshal()
}
