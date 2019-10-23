package bertychat

import (
	"context"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) ConversationMessageList(*ConversationMessageListRequest, Account_ConversationMessageListServer) error {
	return chaterrcode.ErrNotImplemented
}

func (c *client) ConversationMessageSend(context.Context, *ConversationMessageSendRequest) (*ConversationMessageSendReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationMessageEdit(context.Context, *ConversationMessageEditRequest) (*ConversationMessageEditReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationMessageHide(context.Context, *ConversationMessageHideRequest) (*ConversationMessageHideReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
