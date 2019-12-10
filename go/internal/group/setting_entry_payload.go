package group

import (
	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (m *SettingEntryPayload) CheckStructure() error {
	if m.Type == SettingEntryPayload_PayloadTypeUnknown {
		return errcode.ErrInvalidInput
	}

	return nil
}

func (m *SettingEntryPayload) GetSignerPubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(m.MemberPubKey)
}

var _ ClearPayload = (*SettingEntryPayload)(nil)
