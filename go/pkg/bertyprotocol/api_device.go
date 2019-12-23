package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

// DevicePair pairs a new device to the current account
func (c *client) DevicePair(context.Context, *DevicePair_Request) (*DevicePair_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
