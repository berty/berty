package group

import (
	"berty.tech/go/pkg/iface"
)

type module struct {
	crypto iface.Crypto
}

func (m *module) Crypto() iface.Crypto {
	return m.crypto
}

func (m *module) InitGroup(members []iface.CryptoGroupMember, groupMetadata []byte) (iface.CryptoGroup, []iface.CryptoGroupMember, error) {
	// TODO:
	panic("implement me")
}

func (m *module) JoinGroup(groupID []byte, members []iface.CryptoGroupMember, rendezvousSeed []byte, creatorPubKey []byte, groupMetadata []byte) (iface.CryptoGroup, error) {
	// TODO: ensure current device is part of the group

	var groupMembers []*GroupMember

	for _, m := range members {
		member, err := NewGroupMemberFromIface(m)
		if err != nil {
			return nil, err
		}
		groupMembers = append(groupMembers, member)
	}

	group := &wrappedGroup{
		Group: &Group{
			ID:                 groupID,
			RendezvousSeed:     rendezvousSeed,
			CreatorPubKeyBytes: creatorPubKey,
			MemberObjects:      groupMembers,
		},
		crypto: m.crypto,
	}

	// TODO: register group
	// TODO: emit event group joined?
	// TODO: how to add event to group log

	return group, nil
}

func NewGroupsModule(crypto iface.Crypto) iface.CryptoGroupsModule {
	return &module{crypto: crypto}
}

var _ iface.CryptoGroupsModule = (*module)(nil)
