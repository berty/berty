package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) StreamManagerAccept(Instance_StreamManagerAcceptServer) error {
	return errcode.ErrNotImplemented
}
