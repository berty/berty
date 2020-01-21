package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

// ContactRequestReference retrieves the necessary information to create a contact link
func (c *client) ContactRequestReference(context.Context, *ContactRequestReference_Request) (*ContactRequestReference_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestDisable disables incoming contact requests
func (c *client) ContactRequestDisable(context.Context, *ContactRequestDisable_Request) (*ContactRequestDisable_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestEnable enables incoming contact requests
func (c *client) ContactRequestEnable(context.Context, *ContactRequestEnable_Request) (*ContactRequestEnable_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestResetReference generates a new contact request reference
func (c *client) ContactRequestResetReference(context.Context, *ContactRequestResetReference_Request) (*ContactRequestResetReference_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestSend enqueues a new contact request to be sent
func (c *client) ContactRequestSend(context.Context, *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestAccept accepts a contact request
func (c *client) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestDiscard ignores a contact request without informing the request sender
func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscard_Request) (*ContactRequestDiscard_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
