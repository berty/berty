package bertyprotocol

import context "context"

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactRequestListIncoming(*ContactRequestListIncomingRequest, ContactRequestManager_ContactRequestListIncomingServer) error {
	return ErrNotImplemented
}

func (c *client) ContactRequestListOutgoing(*ContactRequestListOutgoingRequest, ContactRequestManager_ContactRequestListOutgoingServer) error {
	return ErrNotImplemented
}

func (c *client) ContactRequestSend(context.Context, *ContactRequestSendRequest) (*ContactRequestSendReply, error) {
	return nil, ErrNotImplemented
}
