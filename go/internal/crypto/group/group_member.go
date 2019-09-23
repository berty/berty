package group

import (
	"context"
	"crypto/sha256"
	"errors"
	"io"

	"berty.tech/go/pkg/iface"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/hkdf"
)

type wrappedGroupMember struct {
	*GroupMember
	crypto iface.Crypto
	group  iface.CryptoGroup
}

func (g *wrappedGroupMember) GetID() []byte {
	panic("implement me")
}

func (g *wrappedGroupMember) GetCounterValue() []byte {
	return g.GetCounterValueAt(g.DerivationCounter)
}

func (g *wrappedGroupMember) GetCounterValueAt(value uint64) []byte {
	panic("implement me")
}

func (g *wrappedGroupMember) GetGroup() iface.CryptoGroup {
	return g.group
}

func (g *wrappedGroupMember) DeriveKey(ctx context.Context, salt []byte) error {
	nextKDFKey, _, err := g.getKeySecrets(salt)
	if err != nil {
		return err
	}

	oldValueDerivationState := g.DerivationState
	oldDerivationCounter := g.DerivationCounter

	g.DerivationState = nextKDFKey
	g.DerivationCounter = g.DerivationCounter + 1

	err = g.crypto.SetDerivationStatusForGroupMember(ctx, g, nextKDFKey, g.DerivationCounter)
	if err != nil {
		g.DerivationState = oldValueDerivationState
		g.DerivationCounter = oldDerivationCounter
		return err
	}

	return nil
}

func (g *wrappedGroupMember) getKeySecrets(salt []byte) ([]byte, []byte, error) {
	var nextKDFKey, nextMsgKey [32]byte

	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	// Generate Pseudo Random Key using currKDFKey as IKM and salt
	prk := hkdf.Extract(hash, g.DerivationState, salt[:])
	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, g.group.GetID())

	// Generate next KDF and message keys
	_, err := io.ReadFull(kdf, nextKDFKey[:])
	if err != nil {
		return nil, nil, err
	}
	_, err = io.ReadFull(kdf, nextMsgKey[:])
	if err != nil {
		return nil, nil, err
	}

	// TODO: alter current key, send event?
	// What should we do with nextMsgKey

	return nextKDFKey[:], nextMsgKey[:], nil
}

func (g *wrappedGroupMember) GetNextSymmetricKey() ([]byte, error) {
	// TODO: salt = g.DerivationCounter

	var salt []byte

	_, key, err := g.getKeySecrets(salt)
	if err != nil {
		return nil, err
	}

	return key, nil
}

func (g *wrappedGroupMember) GetPublicKey() (crypto.PubKey, error) {
	pubKey, err := crypto.UnmarshalPublicKey(g.GetID())

	return pubKey, err
}

func (g *wrappedGroupMember) GetAccountPublicKey() (crypto.PubKey, error) {
	if g.AccountID == nil {
		return nil, errors.New("account id is unknown")
	}

	pubKey, err := crypto.UnmarshalPublicKey(g.AccountID)

	return pubKey, err
}

func (g *wrappedGroupMember) GetSigChain() (iface.SigChain, error) {
	return g.crypto.GetSigChainForAccount(g.AccountID)
}

func (g *GroupMember) Wrap(crypto iface.Crypto, group iface.CryptoGroup) *wrappedGroupMember {
	return &wrappedGroupMember{
		GroupMember: g,
		crypto:      crypto,
		group:       group,
	}
}

func NewGroupMemberFromIface(member iface.CryptoGroupMember) (*GroupMember, error) {
	var accountPubKeyBytes []byte
	accountPubKey, err := member.GetAccountPublicKey()
	if err == nil {
		keyBytes, err := accountPubKey.Bytes()
		if err != nil {
			accountPubKeyBytes = keyBytes
		}
	}

	pubKey, err := member.GetPublicKey()
	if err != nil {
		return nil, err
	}

	pubKeyBytes, err := pubKey.Bytes()
	if err != nil {
		return nil, err
	}

	return &GroupMember{
		PublicKeyBytes:    pubKeyBytes,
		AccountID:         accountPubKeyBytes,
		GroupSecret:       member.GetGroupSecret(),
		DerivationState:   member.GetDerivationState(),
		DerivationCounter: member.GetDerivationCounter(),
	}, nil
}

var _ iface.CryptoGroupMember = (*wrappedGroupMember)(nil)
