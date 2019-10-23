package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}

func (c *client) ContactRequestListIncoming(*ContactRequestListIncomingRequest, Instance_ContactRequestListIncomingServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) ContactRequestListOutgoing(*ContactRequestListOutgoingRequest, Instance_ContactRequestListOutgoingServer) error {
	return errcode.ErrProtocolNotImplemented
}

func (c *client) ContactRequestSend(context.Context, *ContactRequestSendRequest) (*ContactRequestSendReply, error) {
	return nil, errcode.ErrProtocolNotImplemented
}
