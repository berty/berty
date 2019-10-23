package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ConversationMessageList(*ConversationMessageListRequest, Account_ConversationMessageListServer) error {
	return errcode.ErrChatNotImplemented
}

func (c *client) ConversationMessageSend(context.Context, *ConversationMessageSendRequest) (*ConversationMessageSendReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationMessageEdit(context.Context, *ConversationMessageEditRequest) (*ConversationMessageEditReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationMessageHide(context.Context, *ConversationMessageHideRequest) (*ConversationMessageHideReply, error) {
	return nil, errcode.ErrChatNotImplemented
}
