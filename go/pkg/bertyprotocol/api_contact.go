package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

// ContactRemove removes a contact
func (c *client) ContactRemove(context.Context, *ContactRemove_Request) (*ContactRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactBlock blocks a contact, stops advertising on its rendezvous point
func (c *client) ContactBlock(context.Context, *ContactBlock_Request) (*ContactBlock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactUnblock unblocks a contact, resumes advertising on its rendezvous point
func (c *client) ContactUnblock(context.Context, *ContactUnblock_Request) (*ContactUnblock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
