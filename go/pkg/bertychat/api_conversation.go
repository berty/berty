package bertychat

import context "context"

func (c *client) ConversationList(*ConversationListRequest, Account_ConversationListServer) error {
	return ErrNotImplemented
}

func (c *client) ConversationGet(context.Context, *ConversationGetRequest) (*ConversationGetReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationCreate(context.Context, *ConversationCreateRequest) (*ConversationCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationLeave(context.Context, *ConversationLeaveRequest) (*ConversationLeaveReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationErase(context.Context, *ConversationEraseRequest) (*ConversationEraseReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationSetSeenPosition(context.Context, *ConversationSetSeenPositionRequest) (*ConversationSetSeenPositionReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationUpdateSettings(context.Context, *ConversationUpdateSettingsRequest) (*ConversationUpdateSettingsReply, error) {
	return nil, ErrNotImplemented
}
