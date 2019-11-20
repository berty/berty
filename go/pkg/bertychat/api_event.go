package bertychat

import "berty.tech/go/pkg/errcode"

func (c *client) EventSubscribe(*EventSubscribe_Request, ChatService_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) DevEventSubscribe(*DevEventSubscribe_Request, ChatService_DevEventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
