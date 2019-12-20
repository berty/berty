package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

// GroupCreate initiates a new group and joins it
func (c *client) GroupCreate(context.Context, *GroupCreate_Request) (*GroupCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupJoin joins an existing group
func (c *client) GroupJoin(context.Context, *GroupJoin_Request) (*GroupJoin_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupLeave leaves a group
func (c *client) GroupLeave(context.Context, *GroupLeave_Request) (*GroupLeave_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupInvite generates an invitation to a group
func (c *client) GroupInvite(context.Context, *GroupInvite_Request) (*GroupInvite_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupSettingSetGroup sets a setting for a group
func (c *client) GroupSettingSetGroup(context.Context, *GroupSettingSetGroup_Request) (*GroupSettingSetGroup_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupSettingSetGroup sets a setting for own group member
func (c *client) GroupSettingSetMember(context.Context, *GroupSettingSetMember_Request) (*GroupSettingSetMember_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// GroupMessageSend sends a message to the group
func (c *client) GroupMessageSend(context.Context, *GroupMessageSend_Request) (*GroupMessageSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
