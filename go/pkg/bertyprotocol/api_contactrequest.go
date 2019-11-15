package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscard_Request) (*ContactRequestDiscard_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactRequestListIncoming(*ContactRequestListIncoming_Request, ProtocolService_ContactRequestListIncomingServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) ContactRequestListOutgoing(*ContactRequestListOutgoing_Request, ProtocolService_ContactRequestListOutgoingServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) ContactRequestSend(context.Context, *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
