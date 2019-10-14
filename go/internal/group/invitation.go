package group

import (
	"github.com/pkg/errors"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type InvitationMandate struct {
	InviterGroupAccountPubKey p2pcrypto.PubKey
	InvitationPrivKey         p2pcrypto.PrivKey
	InvitationPubKeySignature []byte // Signed by InviterGroupAccountPrivKey
}

func InvitationCreate(inviterGroupAccountPrivKey p2pcrypto.PrivKey) (*InvitationMandate, error) {
	invitationPrivKey, invitationPubKey, err := p2pcrypto.GenerateKeyPair(p2pcrypto.Ed25519, 256)
	if err != nil {
		return nil, errors.Wrap(err, "invitation keypair generation failed")
	}

	invitationPubKeyRaw, err := invitationPubKey.Raw()
	if err != nil {
		return nil, errors.Wrap(err, "can't get invitation pubkey raw value")
	}

	invitationPubKeySignature, err := inviterGroupAccountPrivKey.Sign(invitationPubKeyRaw)
	if err != nil {
		return nil, errors.Wrap(err, "invitation pubkey signature failed")
	}

	return &InvitationMandate{
		InviterGroupAccountPubKey: inviterGroupAccountPrivKey.GetPublic(),
		InvitationPrivKey:         invitationPrivKey,
		InvitationPubKeySignature: invitationPubKeySignature,
	}, nil
}

func (i *InvitationMandate) Accept() error {
	if err := i.Validate(); err != nil {
		return errors.Wrap(err, "invitation validation failed")
	}
	// Add myself to members lists
	// Exchange secrets on dedicated log
	return ErrNotImplemented
}

func (i *InvitationMandate) Discard() error {
	// TODO:
	// Send discard message to inviter only ? Send discard message to whole group ?
	return ErrNotImplemented
}

func (i *InvitationMandate) Validate() error {
	return ErrNotImplemented
}
