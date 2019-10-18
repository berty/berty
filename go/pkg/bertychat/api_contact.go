package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactList(*ContactListRequest, Account_ContactListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactUpdate(context.Context, *ContactUpdateRequest) (*ContactUpdateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, errcode.ErrNotImplemented
}
