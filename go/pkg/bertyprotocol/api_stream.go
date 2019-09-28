package bertyprotocol

import context "context"

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) StreamManagerAccept(StreamManager_StreamManagerAcceptServer) error {
	return ErrNotImplemented
}
