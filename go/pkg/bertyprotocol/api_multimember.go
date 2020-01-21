package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

// MultiMemberGroupCreate creates a new MultiMember group
func (c *client) MultiMemberGroupCreate(context.Context, *MultiMemberGroupCreate_Request) (*MultiMemberGroupCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupJoin joins an existing MultiMember group using an invitation
func (c *client) MultiMemberGroupJoin(context.Context, *MultiMemberGroupJoin_Request) (*MultiMemberGroupJoin_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupLeave leaves a previously joined MultiMember group
func (c *client) MultiMemberGroupLeave(context.Context, *MultiMemberGroupLeave_Request) (*MultiMemberGroupLeave_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupAliasResolverDisclose sends an account identity proof to the group members
func (c *client) MultiMemberGroupAliasResolverDisclose(context.Context, *MultiMemberGroupAliasResolverDisclose_Request) (*MultiMemberGroupAliasResolverDisclose_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupAdminRoleGrant grants admin role to another member of the group
func (c *client) MultiMemberGroupAdminRoleGrant(context.Context, *MultiMemberGroupAdminRoleGrant_Request) (*MultiMemberGroupAdminRoleGrant_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// MultiMemberGroupInvitationCreate creates a group invitation
func (c *client) MultiMemberGroupInvitationCreate(context.Context, *MultiMemberGroupInvitationCreate_Request) (*MultiMemberGroupInvitationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
