package bertychat

import (
	"context"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) ContactList(*ContactListRequest, Account_ContactListServer) error {
	return chaterrcode.ErrNotImplemented
}

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ContactUpdate(context.Context, *ContactUpdateRequest) (*ContactUpdateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
