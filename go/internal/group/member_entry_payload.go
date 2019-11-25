package group

import (
	"berty.tech/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

// CheckStructure checks signatures of the MemberEntryPayload
func (m *MemberEntryPayload) CheckStructure() error {
	inviterPubKey, err := crypto.UnmarshalEd25519PublicKey(m.InviterDevicePubKey)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	ok, err := inviterPubKey.Verify(m.InvitationPubKey, m.InvitationPubKeySignature)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !ok {
		return errcode.ErrGroupMemberLogEventSignature
	}

	invitationPubKey, err := crypto.UnmarshalEd25519PublicKey(m.InvitationPubKey)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	ok, err = invitationPubKey.Verify(m.MemberPubKey, m.MemberPubKeySignature)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !ok {
		return errcode.ErrGroupMemberLogEventSignature
	}

	memberPubKey, err := crypto.UnmarshalEd25519PublicKey(m.MemberPubKey)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	ok, err = memberPubKey.Verify(m.MemberDevicePubKey, m.MemberDevicePubKeySignature)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if !ok {
		return errcode.ErrGroupMemberLogEventSignature
	}

	return nil
}

// ToMemberDevice converts a MemberEntryPayload to a MemberDevice object
func (m *MemberEntryPayload) ToMemberDevice() (*MemberDevice, error) {
	member, err := crypto.UnmarshalEd25519PublicKey(m.MemberPubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	device, err := crypto.UnmarshalEd25519PublicKey(m.MemberDevicePubKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &MemberDevice{
		Device: device,
		Member: member,
	}, nil
}

func (m *MemberEntryPayload) GetDevicePubKey() (crypto.PubKey, error) {
	return crypto.UnmarshalEd25519PublicKey(m.MemberDevicePubKey)
}

// NewMemberEntryPayload creates a new MemberEntryPayload entry using
// an invitation
func NewMemberEntryPayload(memberPrivateKey, memberDevicePrivateKey crypto.PrivKey, invitation *Invitation) (*MemberEntryPayload, error) {
	memberPubKeyBytes, err := memberPrivateKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	memberDevicePubKeyBytes, err := memberDevicePrivateKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	invitationPrivateKey, err := invitation.GetInvitationPrivateKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	invitationPubKeyBytes, err := invitationPrivateKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	memberPubKeySignature, err := invitationPrivateKey.Sign(memberPubKeyBytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	memberDevicePubKeySig, err := memberPrivateKey.Sign(memberDevicePubKeyBytes)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &MemberEntryPayload{
		MemberPubKey:                memberPubKeyBytes,
		MemberPubKeySignature:       memberPubKeySignature,
		MemberDevicePubKey:          memberDevicePubKeyBytes,
		MemberDevicePubKeySignature: memberDevicePubKeySig,
		InviterDevicePubKey:         invitation.InviterDevicePubKey,
		InvitationPubKey:            invitationPubKeyBytes,
		InvitationPubKeySignature:   invitation.InvitationPubKeySignature,
	}, nil
}

var _ ClearPayload = (*MemberEntryPayload)(nil)
