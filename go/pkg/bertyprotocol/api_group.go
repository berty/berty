package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) GroupCreate(context.Context, *GroupCreateRequest) (*GroupCreateReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupList(*GroupListRequest, Instance_GroupListServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageListRequest, Instance_GroupMessageListServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) GroupPubSubTopicInit(Instance_GroupPubSubTopicInitServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) GroupPubSubTopicSubscribe(*GroupPubSubTopicSubscribeRequest, Instance_GroupPubSubTopicSubscribeServer) error {
	return errcode.ErrProtocolNotImplemented
}
