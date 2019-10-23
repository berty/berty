package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/protocolerrcode"
)

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) ContactList(*ContactListRequest, Instance_ContactListServer) error {
	return protocolerrcode.ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}
