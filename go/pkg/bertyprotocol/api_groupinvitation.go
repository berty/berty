package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) GroupInvitationAccept(context.Context, *GroupInvitationAcceptRequest) (*GroupInvitationAcceptReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupInvitationCreate(context.Context, *GroupInvitationCreateRequest) (*GroupInvitationCreateReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupInvitationDiscard(context.Context, *GroupInvitationDiscardRequest) (*GroupInvitationDiscardReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) GroupInvitationList(*GroupInvitationListRequest, Instance_GroupInvitationListServer) error {
	return errcode.ErrProtocolNotImplemented
}
