package groups

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type groupBroadcast struct{}

func (g *groupBroadcast) GetID() []byte {
	panic("implement me")
}

func (g *groupBroadcast) Close() error {
	panic("implement me")
}

func (g *groupBroadcast) GetLastPayload() iface.GroupBroadcastMessage {
	panic("implement me")
}

func (g *groupBroadcast) Subscribe(ctx context.Context) (chan<- iface.GroupBroadcastMessage, error) {
	panic("implement me")
}

func (g *groupBroadcast) Send(ctx context.Context, payload []byte) error {
	panic("implement me")
}

var _ iface.GroupBroadcast = (*groupBroadcast)(nil)
