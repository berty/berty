package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) GroupInvitationAccept(context.Context, *GroupInvitationAccept_Request) (*GroupInvitationAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupInvitationCreate(context.Context, *GroupInvitationCreate_Request) (*GroupInvitationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupInvitationDiscard(context.Context, *GroupInvitationDiscard_Request) (*GroupInvitationDiscard_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) GroupInvitationList(*GroupInvitationList_Request, ProtocolService_GroupInvitationListServer) error {
	return errcode.ErrNotImplemented
}
