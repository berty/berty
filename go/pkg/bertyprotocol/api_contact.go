package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactGet(ctx context.Context, in *ContactGet_Request) (*ContactGet_Reply, error) {
	ret := &ContactGet_Reply{}
	return ret, nil
}

func (c *client) ContactList(*ContactList_Request, ProtocolService_ContactListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemove_Request) (*ContactRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
