package bertychat

import "berty.tech/go/pkg/errcode"

func (c *client) DevEventSubscribe(*DevEventSubscribeRequest, Account_DevEventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
