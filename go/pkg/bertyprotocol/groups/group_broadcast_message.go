package groups

import "berty.tech/go/pkg/iface"

type groupBroadcastMessage struct{}

func (g *groupBroadcastMessage) GetID() []byte {
	panic("implement me")
}

func (g *groupBroadcastMessage) GetGroupBroadcast() iface.GroupBroadcast {
	panic("implement me")
}

func (g *groupBroadcastMessage) GetPayload() []byte {
	panic("implement me")
}

var _ iface.GroupBroadcastMessage = (*groupBroadcastMessage)(nil)
