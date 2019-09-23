package groups

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type groupInvitation struct{}

func (g *groupInvitation) GetID() []byte {
	panic("implement me")
}

func (g *groupInvitation) GetRendezvousPoint() []byte {
	panic("implement me")
}

func (g *groupInvitation) GetGroupID() []byte {
	panic("implement me")
}

func (g *groupInvitation) AcceptRequest(ctx context.Context) (iface.Group, error) {
	panic("implement me")
}

func (g *groupInvitation) DiscardRequest(ctx context.Context) error {
	panic("implement me")
}

var _ iface.GroupInvitation = (*groupInvitation)(nil)
