package messengertypes

import (
	fmt "fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	protocoltypes "berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (link *BertyLink) IsValid() error {
	if link == nil {
		return errcode.ErrMissingInput
	}
	switch link.Kind {
	case BertyLink_ContactInviteV1Kind:
		if link.BertyID == nil ||
			link.BertyID.AccountPK == nil ||
			link.BertyID.PublicRendezvousSeed == nil {
			return errcode.ErrMissingInput
		}
		return nil

	case BertyLink_GroupV1Kind:
		if link.BertyGroup == nil {
			return errcode.ErrMissingInput
		}
		if groupType := link.BertyGroup.Group.GroupType; groupType != protocoltypes.GroupTypeMultiMember {
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't share a %q group type", groupType))
		}
		return nil

	case BertyLink_EncryptedV1Kind:
		if link.Encrypted == nil {
			return errcode.ErrMissingInput
		}
		switch link.Encrypted.Kind {
		case BertyLink_ContactInviteV1Kind:
			if link.Encrypted.ContactAccountPK == nil ||
				link.Encrypted.ContactPublicRendezvousSeed == nil {
				return errcode.ErrMissingInput
			}
		case BertyLink_GroupV1Kind:
			if groupType := link.Encrypted.GroupType; groupType != protocoltypes.GroupTypeMultiMember {
				return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't share a %q group type", groupType))
			}
		default:
			return errcode.ErrInvalidInput
		}
		return nil
	case BertyLink_MessageV1Kind:
		if link.BertyMessageRef == nil {
			return errcode.ErrMissingInput
		}
		return nil
	}

	return errcode.ErrInvalidInput
}

func (link *BertyLink) IsContact() bool {
	return link.Kind == BertyLink_ContactInviteV1Kind &&
		link.IsValid() == nil
}

func (link *BertyLink) IsGroup() bool {
	return link.Kind == BertyLink_GroupV1Kind &&
		link.IsValid() == nil
}

func (id *BertyID) GetBertyLink() *BertyLink {
	return &BertyLink{
		Kind:    BertyLink_ContactInviteV1Kind,
		BertyID: id,
	}
}

func (group *BertyGroup) GetBertyLink() *BertyLink {
	return &BertyLink{
		Kind:       BertyLink_GroupV1Kind,
		BertyGroup: group,
	}
}
