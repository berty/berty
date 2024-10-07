package messengertypes

import (
	fmt "fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	protocoltypes "berty.tech/weshnet/v2/pkg/protocoltypes"
)

func (link *BertyLink) IsValid() error {
	if link == nil {
		return errcode.ErrCode_ErrMissingInput
	}
	switch link.Kind {
	case BertyLink_ContactInviteV1Kind:
		if link.BertyId == nil ||
			link.BertyId.AccountPk == nil ||
			link.BertyId.PublicRendezvousSeed == nil {
			return errcode.ErrCode_ErrMissingInput
		}
		return nil

	case BertyLink_GroupV1Kind:
		if link.BertyGroup == nil {
			return errcode.ErrCode_ErrMissingInput
		}
		if groupType := link.BertyGroup.Group.GroupType; groupType != protocoltypes.GroupType_GroupTypeMultiMember {
			return errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("can't share a %q group type", groupType))
		}
		return nil

	case BertyLink_EncryptedV1Kind:
		if link.Encrypted == nil {
			return errcode.ErrCode_ErrMissingInput
		}
		switch link.Encrypted.Kind {
		case BertyLink_ContactInviteV1Kind:
			if link.Encrypted.ContactAccountPk == nil ||
				link.Encrypted.ContactPublicRendezvousSeed == nil {
				return errcode.ErrCode_ErrMissingInput
			}
		case BertyLink_GroupV1Kind:
			if groupType := link.Encrypted.GroupType; groupType != protocoltypes.GroupType_GroupTypeMultiMember {
				return errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("can't share a %q group type", groupType))
			}
		default:
			return errcode.ErrCode_ErrInvalidInput
		}
		return nil
	case BertyLink_MessageV1Kind:
		if link.BertyMessageRef == nil {
			return errcode.ErrCode_ErrMissingInput
		}
		return nil
	}

	return errcode.ErrCode_ErrInvalidInput
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
		BertyId: id,
	}
}

func (group *BertyGroup) GetBertyLink() *BertyLink {
	return &BertyLink{
		Kind:       BertyLink_GroupV1Kind,
		BertyGroup: group,
	}
}
