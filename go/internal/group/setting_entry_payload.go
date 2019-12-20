package group

import (
	"berty.tech/berty/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (m *SettingsEntryPayload) CheckStructure() error {
	if m.Type == SettingsEntryPayload_PayloadTypeUnknown {
		return errcode.ErrInvalidInput
	}

	return nil
}

func (m *SettingsEntryPayload) GetSignerPubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(m.MemberPubKey)
}

var _ ClearPayload = (*SettingsEntryPayload)(nil)
