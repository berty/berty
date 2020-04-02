package bertytypes

import (
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

const RendezvousSeedLength = 32

func (m *ShareableContact) CheckFormat() error {
	if l := len(m.PublicRendezvousSeed); l != RendezvousSeedLength {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("rendezvous seed length should not be %d", l))
	}

	_, err := crypto.UnmarshalEd25519PublicKey(m.PK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	return nil
}
func (m *ShareableContact) IsSamePK(otherPK crypto.PubKey) bool {
	pk, err := m.GetPubKey()
	if err != nil {
		return false
	}

	return otherPK.Equals(pk)
}

func (m *ShareableContact) GetPubKey() (crypto.PubKey, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(m.PK)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	return pk, nil
}
