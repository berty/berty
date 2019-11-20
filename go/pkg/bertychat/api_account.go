package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) AccountList(*AccountList_Request, ChatService_AccountListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) AccountGet(context.Context, *AccountGet_Request) (*AccountGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountCreate(context.Context, *AccountCreate_Request) (*AccountCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountUpdate(context.Context, *AccountUpdate_Request) (*AccountUpdate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountOpen(context.Context, *AccountOpen_Request) (*AccountOpen_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountClose(context.Context, *AccountClose_Request) (*AccountClose_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountRemove(context.Context, *AccountRemove_Request) (*AccountRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountPairingInvitationCreate(context.Context, *AccountPairingInvitationCreate_Request) (*AccountPairingInvitationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountRenewIncomingContactRequestLink(context.Context, *AccountRenewIncomingContactRequestLink_Request) (*AccountRenewIncomingContactRequestLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
