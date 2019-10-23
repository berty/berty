package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ConversationInvitationAccept(context.Context, *ConversationInvitationAcceptRequest) (*ConversationInvitationAcceptReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationInvitationCreate(context.Context, *ConversationInvitationCreateRequest) (*ConversationInvitationCreateReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) ConversationInvitationDiscard(context.Context, *ConversationInvitationDiscardRequest) (*ConversationInvitationDiscardReply, error) {
	return nil, errcode.ErrChatNotImplemented
}
