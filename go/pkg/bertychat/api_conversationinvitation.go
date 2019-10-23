package bertychat

import (
	"context"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) ConversationInvitationAccept(context.Context, *ConversationInvitationAcceptRequest) (*ConversationInvitationAcceptReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationInvitationCreate(context.Context, *ConversationInvitationCreateRequest) (*ConversationInvitationCreateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ConversationInvitationDiscard(context.Context, *ConversationInvitationDiscardRequest) (*ConversationInvitationDiscardReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
