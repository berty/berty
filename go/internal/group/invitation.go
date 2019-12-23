package group

import (
	"crypto/rand"

	"golang.org/x/crypto/ed25519"

	"berty.tech/berty/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
	pb "github.com/libp2p/go-libp2p-core/crypto/pb"
)

func ed25519KeyFromSeed(seed []byte) (crypto.PrivKey, error) {
	privWithPub := ed25519.NewKeyFromSeed(seed)

	return crypto.UnmarshalEd25519PrivateKey(privWithPub)
}

func (m *Invitation) GetGroup() (*Group, error) {
	pk, err := m.GetGroupPublicKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKey, err := ed25519KeyFromSeed(m.GroupSigningKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &Group{
		PubKey:     pk,
		SigningKey: signingKey,
	}, nil
}

func (m *Invitation) GetInviterDevicePublicKey() (crypto.PubKey, error) {
	if m.InviterDevicePubKey == nil {
		return nil, errcode.ErrInvalidInput
	}

	return crypto.UnmarshalEd25519PublicKey(m.InviterDevicePubKey)
}

func (m *Invitation) GetInvitationPrivateKey() (crypto.PrivKey, error) {
	if m.InvitationPrivKey == nil {
		return nil, errcode.ErrInvalidInput
	}

	privWithPub := ed25519.NewKeyFromSeed(m.InvitationPrivKey)

	invitationPrivKey, err := crypto.UnmarshalEd25519PrivateKey(privWithPub)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return invitationPrivKey, nil
}

func (m *Invitation) GetGroupPublicKey() (crypto.PubKey, error) {
	if m.GroupPubKey == nil {
		return nil, errcode.ErrInvalidInput
	}

	return crypto.UnmarshalEd25519PublicKey(m.GroupPubKey)
}

// NewInvitation generates a new Invitation to a group, the signer must be
// a current member device of the group
func NewInvitation(inviterDevice crypto.PrivKey, group *Group) (*Invitation, error) {
	if group == nil || inviterDevice == nil || group.SigningKey == nil || group.PubKey == nil {
		return nil, errcode.ErrInvalidInput
	}

	priv, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	privBytes, err := seedFromEd25519PrivateKey(priv)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	pubBytes, err := priv.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	sig, err := inviterDevice.Sign(pubBytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	groupPubKeyBytes, err := group.PubKey.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	inviterDevicePubKeyBytes, err := inviterDevice.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := seedFromEd25519PrivateKey(group.SigningKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &Invitation{
		InviterDevicePubKey:       inviterDevicePubKeyBytes,
		InvitationPrivKey:         privBytes,
		InvitationPubKeySignature: sig,

		GroupVersion:    CurrentGroupVersion,
		GroupPubKey:     groupPubKeyBytes,
		GroupSigningKey: signingKeyBytes,
	}, nil
}

func seedFromEd25519PrivateKey(key crypto.PrivKey) ([]byte, error) {
	// Similar to (*ed25519).Seed()
	if key.Type() != pb.KeyType_Ed25519 {
		return nil, errcode.ErrInvalidInput
	}

	r, err := key.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if len(r) != ed25519.PrivateKeySize {
		return nil, errcode.ErrInvalidInput
	}

	return r[:ed25519.PrivateKeySize-ed25519.PublicKeySize], nil
}
