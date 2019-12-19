package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
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
func (c *client) ContactRequestResetReference(context.Context, *ContactRequestResetLink_Request) (*ContactRequestResetLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestEnqueue enqueues a new contact request to be sent
func (c *client) ContactRequestEnqueue(context.Context, *ContactRequestEnqueue_Request) (*ContactRequestEnqueue_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

// ContactRequestAccept accepts a contact request
func (c *client) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
