package bertychat

import context "context"

func (c *client) ContactRequestCreate(context.Context, *ContactRequestCreateRequest) (*ContactRequestCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, ErrNotImplemented
}
