package bertyprotocol

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"io/ioutil"

	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"

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

func (m *Group) IsValid() error {
	pk, err := m.GetPubKey()
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	ok, err := pk.Verify(m.Secret, m.SecretSig)
	if err != nil {
		return errcode.ErrSignatureVerificationFailed.Wrap(err)
	}

	if !ok {
		return errcode.ErrSignatureVerificationFailed
	}

	return nil
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

func getKeysForGroupOfContact(contactPairSK crypto.PrivKey) (crypto.PrivKey, crypto.PrivKey, error) {
	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	ck, err := contactPairSK.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	// Generate Pseudo Random Key using ck as IKM and salt
	prk := hkdf.Extract(hash, ck[:], nil)
	if len(prk) == 0 {
		return nil, nil, errcode.ErrInternal
	}

	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, nil)

	// Generate next KDF and message keys
	groupSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	groupSecretSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	sk1 := ed25519.NewKeyFromSeed(groupSeed)
	groupSK, _, err := crypto.KeyPairFromStdKey(&sk1)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	sk2 := ed25519.NewKeyFromSeed(groupSecretSeed)
	groupSecretSK, _, err := crypto.KeyPairFromStdKey(&sk2)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	return groupSK, groupSecretSK, nil
}

func GetGroupForContact(contactPairSK crypto.PrivKey) (*Group, error) {
	groupSK, groupSecretSK, err := getKeysForGroupOfContact(contactPairSK)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}
	pubBytes, err := groupSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(groupSecretSK)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: GroupTypeContact,
	}, nil
}

func GetGroupForAccount(priv, signing crypto.PrivKey) (*Group, error) {
	pubBytes, err := priv.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: GroupTypeAccount,
	}, nil
}
