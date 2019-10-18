package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactRequestCreate(context.Context, *ContactRequestCreateRequest) (*ContactRequestCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, errcode.ErrNotImplemented
}
