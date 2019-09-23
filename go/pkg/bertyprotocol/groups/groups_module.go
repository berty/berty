package groups

import (
	"context"

	"berty.tech/go/pkg/iface"
)

type module struct{}

func (m *module) ListGroups(ctx context.Context) (chan<- iface.Group, error) {
	panic("implement me")
}

func (m *module) ListIncomingInvitations(ctx context.Context) (chan<- iface.GroupMember, error) {
	panic("implement me")
}

func (m *module) Create(ctx context.Context, members []iface.Contact /* meta (name ...) */) {
	panic("implement me")
}

func NewGroupsModule() iface.GroupsModule {
	return &module{}
}

var _ iface.GroupsModule = (*module)(nil)
