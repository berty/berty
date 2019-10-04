package bertyprotocol

import "context"

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) StreamManagerAccept(Instance_StreamManagerAcceptServer) error {
	return ErrNotImplemented
}
