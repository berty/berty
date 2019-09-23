package groups

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type group struct{}

func (g *group) GetRendezvousSeed() []byte {
	panic("implement me")
}

func (g *group) GetID() []byte {
	panic("implement me")
}

func (g *group) GetRendezvousPoint() []byte {
	panic("implement me")
}

func (g *group) ListMessages(ctx context.Context) (chan<- iface.GroupMessage, error) {
	panic("implement me")
}

func (g *group) InviteContact(ctx context.Context, contact iface.Contact) error {
	panic("implement me")
}

func (g *group) GenerateInviteToken(ctx context.Context) ([]byte, error) {
	panic("implement me")
}

func (g *group) AddMessage(ctx context.Context, payload []byte) (iface.GroupMessage, error) {
	panic("implement me")
}

func (g *group) InitGroupBroadcast(ctx context.Context) (iface.GroupBroadcast, error) {
	panic("implement me")
}

func (g *group) Leave(ctx context.Context) error {
	panic("implement me")
}

var _ iface.Group = (*group)(nil)
