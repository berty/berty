package bertychat

import context "context"

func (c *client) ContactList(*ContactListRequest, Account_ContactListServer) error {
	return ErrNotImplemented
}

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactUpdate(context.Context, *ContactUpdateRequest) (*ContactUpdateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, ErrNotImplemented
}
