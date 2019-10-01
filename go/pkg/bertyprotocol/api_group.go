package bertyprotocol

import context "context"

func (c *client) GroupCreate(context.Context, *GroupCreateRequest) (*GroupCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupList(*GroupListRequest, Protocol_GroupListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageListRequest, Protocol_GroupMessageListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicInit(Protocol_GroupPubSubTopicInitServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicSubscribe(*GroupPubSubTopicSubscribeRequest, Protocol_GroupPubSubTopicSubscribeServer) error {
	return ErrNotImplemented
}
