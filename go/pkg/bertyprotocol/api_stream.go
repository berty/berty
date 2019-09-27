package bertyprotocol

import context "context"

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) StreamManagerAccept(Protocol_StreamManagerAcceptServer) error {
	return ErrNotImplemented
}
