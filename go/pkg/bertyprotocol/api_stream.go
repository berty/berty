package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/protocolerrcode"
)

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) StreamManagerAccept(Instance_StreamManagerAcceptServer) error {
	return protocolerrcode.ErrNotImplemented
}
