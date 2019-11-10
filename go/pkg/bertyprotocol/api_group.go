package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) GroupCreate(context.Context, *GroupCreateRequest) (*GroupCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupList(*GroupListRequest, Instance_GroupListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageListRequest, Instance_GroupMessageListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupTopicPublish(Instance_GroupTopicPublishServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupTopicSubscribe(*GroupTopicSubscribeRequest, Instance_GroupTopicSubscribeServer) error {
	return errcode.ErrNotImplemented
}
