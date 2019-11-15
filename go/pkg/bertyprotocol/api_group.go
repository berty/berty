package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) GroupCreate(context.Context, *GroupCreate_Request) (*GroupCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLink_Request) (*GroupGenerateInviteLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeave_Request) (*GroupLeave_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupList(*GroupList_Request, ProtocolService_GroupListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreate_Request) (*GroupMessageCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageList_Request, ProtocolService_GroupMessageListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupTopicPublish(ProtocolService_GroupTopicPublishServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) GroupTopicSubscribe(*GroupTopicSubscribe_Request, ProtocolService_GroupTopicSubscribeServer) error {
	return errcode.ErrNotImplemented
}
