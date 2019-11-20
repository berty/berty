package bertychat

import "berty.tech/go/pkg/errcode"

func (c *client) Search(*Search_Request, ChatService_SearchServer) error {
	return errcode.ErrNotImplemented
}
