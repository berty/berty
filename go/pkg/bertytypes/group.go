package bertytypes

import (
	"encoding/hex"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/ed25519"
)

func (m *Group) GetSigningPrivKey() (crypto.PrivKey, error) {
	edSK := ed25519.NewKeyFromSeed(m.Secret)

	sk, _, err := crypto.KeyPairFromStdKey(&edSK)
	if err != nil {
		return nil, err
	}

	return sk, nil
}

func (m *Group) GetPubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(m.PublicKey)
}

func (m *Group) GetSigningPubKey() (crypto.PubKey, error) {
	sk, err := m.GetSigningPrivKey()
	if err != nil {
		return nil, err
	}

	return sk.GetPublic(), nil
}

func (m *Group) IsValid() error {
	pk, err := m.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err := pk.Verify(m.Secret, m.SecretSig)
	if err != nil {
		return errcode.ErrCryptoSignatureVerification.Wrap(err)
	}

	if !ok {
		return errcode.ErrCryptoSignatureVerification
	}

	return nil
}

// GroupIDAsString returns the group pub key as a string
func (m *Group) GroupIDAsString() string {
	return hex.EncodeToString(m.PublicKey)
}

func (m *Group) GetSharedSecret() (*[32]byte, error) {
	sharedSecret := [32]byte{}
	copy(sharedSecret[:], m.Secret)

	return &sharedSecret, nil
}
