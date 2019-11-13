package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactGet(context.Context, *ContactGet_Request) (*ContactGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactList(*ContactList_Request, ProtocolService_ContactListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemove_Request) (*ContactRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
