package protocoltypes

import (
	"encoding/hex"

	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/ed25519"

	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Group) GetSigningPrivKey() (crypto.PrivKey, error) {
	if len(m.Secret) == 0 {
		return nil, errcode.ErrMissingInput
	}

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
	if len(m.SignPub) != 0 {
		return crypto.UnmarshalEd25519PublicKey(m.SignPub)
	}

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

func (m *Group) Copy() *Group {
	return &Group{
		PublicKey: m.PublicKey,
		Secret:    m.Secret,
		SecretSig: m.SecretSig,
		GroupType: m.GroupType,
		SignPub:   m.SignPub,
	}
}
