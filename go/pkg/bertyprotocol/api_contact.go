package bertyprotocol

import context "context"

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactList(*ContactListRequest, ContactManager_ContactListServer) error {
	return ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, ErrNotImplemented
}
