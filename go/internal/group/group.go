package group

import (
	"crypto/rand"
	"encoding/hex"

	"berty.tech/berty/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
	"golang.org/x/crypto/ed25519"
)

const CurrentGroupVersion = 1

// Group is a struct containing the cryptographic material to access its data
type Group struct {
	PubKey     crypto.PubKey
	SigningKey crypto.PrivKey
}

// GroupIDAsString returns the group pub key as a string
func (g *Group) GroupIDAsString() (string, error) {
	pkBytes, err := g.PubKey.Raw()
	if err != nil {
		return "", errcode.ErrSerialization.Wrap(err)
	}

	return hex.EncodeToString(pkBytes), nil
}

// GroupID returns the group ID as a byte slice
func (g *Group) GroupID() ([]byte, error) {
	groupID, err := g.PubKey.Raw()

	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return groupID, nil
}

// New creates a new Group object and an invitation to be used by
// the first member of the group
func New() (*Group, crypto.PrivKey, error) {
	priv, pub, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	signing, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	group := &Group{
		PubKey:     pub,
		SigningKey: signing,
	}

	return group, priv, nil
}

func (g *Group) GetSharedSecret() (*[32]byte, error) {
	s, err := seedFromEd25519PrivateKey(g.SigningKey)
	if err != nil {
		return nil, err
	}

	sharedSecret := [32]byte{}
	copy(sharedSecret[:], s[:])

	return &sharedSecret, nil
}

func seedFromEd25519PrivateKey(key crypto.PrivKey) ([]byte, error) {
	// Similar to (*ed25519).Seed()
	if key.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	r, err := key.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	if len(r) != ed25519.PrivateKeySize {
		return nil, errcode.ErrInvalidInput
	}

	return r[:ed25519.PrivateKeySize-ed25519.PublicKeySize], nil
}
