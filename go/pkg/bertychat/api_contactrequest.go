package bertychat

import (
	"context"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) ContactRequestCreate(context.Context, *ContactRequestCreateRequest) (*ContactRequestCreateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
