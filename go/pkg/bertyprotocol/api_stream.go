package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContact_Request) (*StreamManagerRequestToContact_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) StreamManagerAccept(ProtocolService_StreamManagerAcceptServer) error {
	return errcode.ErrNotImplemented
}
