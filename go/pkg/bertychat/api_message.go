package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) MessageList(*MessageList_Request, ChatService_MessageListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) MessageGet(context.Context, *MessageGet_Request) (*MessageGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) MessageSend(context.Context, *MessageSend_Request) (*MessageSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) MessageEdit(context.Context, *MessageEdit_Request) (*MessageEdit_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) MessageHide(context.Context, *MessageHide_Request) (*MessageHide_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) MessageReact(context.Context, *MessageReact_Request) (*MessageReact_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) MessageRead(context.Context, *MessageRead_Request) (*MessageRead_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
