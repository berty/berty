package bertyprotocol

import context "context"

func (c *client) GroupInvitationAccept(context.Context, *GroupInvitationAcceptRequest) (*GroupInvitationAcceptReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupInvitationCreate(context.Context, *GroupInvitationCreateRequest) (*GroupInvitationCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupInvitationDiscard(context.Context, *GroupInvitationDiscardRequest) (*GroupInvitationDiscardReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupInvitationList(*GroupInvitationListRequest, GroupInvitationManager_GroupInvitationListServer) error {
	return ErrNotImplemented
}
