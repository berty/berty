package group

import (
	"bytes"
	"context"
	"errors"
	"time"

	"berty.tech/go/internal/crypto/envelope"
	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"
)

type wrappedGroup struct {
	*Group
	crypto iface.Crypto
}

func (g *wrappedGroup) GetCreatorPubKey() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(g.CreatorPubKeyBytes)
	if err != nil {
		return nil, err
	}

	return pubKey, nil
}

func (g *wrappedGroup) GetMembers() []iface.CryptoGroupMember {
	var members []iface.CryptoGroupMember

	for _, m := range g.MemberObjects {
		members = append(members, m.Wrap(g.crypto, g))
	}

	return members
}

func (g *wrappedGroup) SealMessage(ctx context.Context, payload []byte) (env iface.CryptoEnvelope, symKey []byte, err error) {
	sig, err := g.crypto.Sign(payload)

	secret, err := g.getOwnCurrentSecret()
	if err != nil {
		return nil, nil, err
	}

	symKey, err = secret.GetNextSymmetricKey()
	if err != nil {
		return nil, nil, err
	}

	var symKeyArray [32]byte
	var derivationCounterArray [24]byte

	derivationCounter := secret.GetCounterValue()
	copy(symKeyArray[:], symKey)
	copy(derivationCounterArray[:], derivationCounter)

	encryptedEvent := secretbox.Seal(nil, payload, &derivationCounterArray, &symKeyArray)

	err = secret.DeriveKey(ctx, derivationCounter)
	if err != nil {
		return nil, nil, err
	}

	env = &envelope.Envelope{
		GroupID:   g.ID,
		SenderID:  secret.GetID(),
		Counter:   secret.GetCounterValue(),
		Event:     encryptedEvent,
		Timestamp: time.Now(),
		Signature: sig,
	}

	return env, symKey, nil
}

func (g *wrappedGroup) OpenMessage(env iface.CryptoEnvelope) (payload []byte, symKey []byte, err error) {
	// TODO:
	panic("implement me")
}

func (g *wrappedGroup) AddMembers([]iface.CryptoGroupMember) ([]iface.CryptoGroupMember, error) {
	// TODO:
	panic("implement me")
}

func (g *wrappedGroup) getCurrentSecretForKey(key crypto.PubKey) (iface.CryptoGroupMember, error) {
	identityBytes, err := key.Bytes()
	if err != nil {
		return nil, err
	}

	for _, m := range g.MemberObjects {
		if bytes.Compare(m.PublicKeyBytes, identityBytes) == 0 {
			return m.Wrap(g.crypto, g), nil
		}
	}
	return nil, errors.New("identity not found")
}

func (g *wrappedGroup) getOwnCurrentSecret() (iface.CryptoGroupMember, error) {
	return g.getCurrentSecretForKey(g.crypto.GetDevicePublicKey())
}

//func NewGroupFromIface(group iface.Group) (*Group, error) {
//	return &Group{
//		ID:                 group.GetID(),
//		RendezvousSeed:     group.GetRendezvousPoint(),
//		CreatorPubKeyBytes: nil,
//		MemberObjects:      nil,
//	}, nil
//}

var _ iface.CryptoGroup = (*wrappedGroup)(nil)
