package group

import (
	"crypto/rand"
	"encoding/hex"

	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

const CurrentGroupVersion = 1

// Group is a struct containing the cryptographic material to access its data
type Group struct {
	PubKey     crypto.PubKey
	SigningKey crypto.PrivKey
}

// MemberDevice is a device part of a group
type MemberDevice struct {
	Member crypto.PubKey
	Device crypto.PubKey
}

// GroupIDAsString returns the group pub key as a string
func (g *Group) GroupIDAsString() (string, error) {
	pkBytes, err := g.PubKey.Raw()
	if err != nil {
		return "", errcode.TODO.Wrap(err)
	}

	return hex.EncodeToString(pkBytes), nil
}

// New creates a new Group object and an invitation to be used by
// the first member of the group
func New() (*Group, *Invitation, error) {
	priv, pub, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	signing, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	group := &Group{
		PubKey:     pub,
		SigningKey: signing,
	}

	invitation, err := NewInvitation(priv, group)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	return group, invitation, nil
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
