package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/protocolerrcode"
)

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) ContactRequestListIncoming(*ContactRequestListIncomingRequest, Instance_ContactRequestListIncomingServer) error {
	return protocolerrcode.ErrNotImplemented
}

func (c *client) ContactRequestListOutgoing(*ContactRequestListOutgoingRequest, Instance_ContactRequestListOutgoingServer) error {
	return protocolerrcode.ErrNotImplemented
}

func (c *client) ContactRequestSend(context.Context, *ContactRequestSendRequest) (*ContactRequestSendReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}
