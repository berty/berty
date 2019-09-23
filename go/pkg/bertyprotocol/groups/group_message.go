package groups

import "berty.tech/go/pkg/iface"

type groupMessage struct{}

func (g *groupMessage) GetID() []byte {
	panic("implement me")
}

func (g *groupMessage) GetMember() iface.GroupMember {
	panic("implement me")
}

func (g *groupMessage) GetPayload() []byte {
	panic("implement me")
}

var _ iface.GroupMessage = (*groupMessage)(nil)
