package bertyprotocol

import "context"

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactList(*ContactListRequest, Instance_ContactListServer) error {
	return ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, ErrNotImplemented
}
