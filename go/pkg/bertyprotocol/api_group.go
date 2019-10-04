package bertyprotocol

import "context"

func (c *client) GroupCreate(context.Context, *GroupCreateRequest) (*GroupCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupList(*GroupListRequest, Instance_GroupListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageListRequest, Instance_GroupMessageListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicInit(Instance_GroupPubSubTopicInitServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicSubscribe(*GroupPubSubTopicSubscribeRequest, Instance_GroupPubSubTopicSubscribeServer) error {
	return ErrNotImplemented
}
