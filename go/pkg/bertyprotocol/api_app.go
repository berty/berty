package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *client) AppMetadataSend(context.Context, *AppMetadataSend_Request) (*AppMetadataSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AppMessageSend(context.Context, *AppMessageSend_Request) (*AppMessageSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
