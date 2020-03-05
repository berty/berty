package bertyprotocol

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/cryptoutil"
	"berty.tech/berty/go/pkg/errcode"
)

const CurrentGroupVersion = 1

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

// GroupIDAsString returns the group pub key as a string
func (m *Group) GroupIDAsString() string {
	return hex.EncodeToString(m.PublicKey)
}

func (m *Group) GetSharedSecret() (*[32]byte, error) {
	sharedSecret := [32]byte{}
	copy(sharedSecret[:], m.Secret[:])

	return &sharedSecret, nil
}

// New creates a new Group object and an invitation to be used by
// the first member of the group
func NewGroupMultiMember() (*Group, crypto.PrivKey, error) {
	priv, pub, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	pubBytes, err := pub.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	signing, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	skSig, err := priv.Sign(signingBytes)
	if err != nil {
		return nil, nil, errcode.ErrSignatureFailed.Wrap(err)
	}

	group := &Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: skSig,
		GroupType: GroupTypeMultiMember,
	}

	return group, priv, nil
}
