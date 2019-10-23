package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) ContactList(*ContactListRequest, Instance_ContactListServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}
