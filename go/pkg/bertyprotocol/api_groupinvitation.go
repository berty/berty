package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/protocolerrcode"
)

func (c *client) GroupInvitationAccept(context.Context, *GroupInvitationAcceptRequest) (*GroupInvitationAcceptReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) GroupInvitationCreate(context.Context, *GroupInvitationCreateRequest) (*GroupInvitationCreateReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) GroupInvitationDiscard(context.Context, *GroupInvitationDiscardRequest) (*GroupInvitationDiscardReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) GroupInvitationList(*GroupInvitationListRequest, Instance_GroupInvitationListServer) error {
	return protocolerrcode.ErrNotImplemented
}
