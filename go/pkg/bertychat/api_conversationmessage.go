package bertychat

import context "context"

func (c *client) ConversationMessageList(*ConversationMessageListRequest, Account_ConversationMessageListServer) error {
	return ErrNotImplemented
}

func (c *client) ConversationMessageSend(context.Context, *ConversationMessageSendRequest) (*ConversationMessageSendReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationMessageEdit(context.Context, *ConversationMessageEditRequest) (*ConversationMessageEditReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ConversationMessageHide(context.Context, *ConversationMessageHideRequest) (*ConversationMessageHideReply, error) {
	return nil, ErrNotImplemented
}
