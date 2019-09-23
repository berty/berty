package groups

import "berty.tech/go/pkg/iface"

type groupMember struct{}

func (g *groupMember) GetID() []byte {
	panic("implement me")
}

func (g *groupMember) GetPublicKey() []byte {
	panic("implement me")
}

func (g *groupMember) GetSignature() []byte {
	panic("implement me")
}

func (g *groupMember) GetGroup() iface.Group {
	panic("implement me")
}

func (g *groupMember) GetDevice() iface.Device {
	panic("implement me")
}

var _ iface.GroupMember = (*groupMember)(nil)
