package bertychat

import "berty.tech/go/pkg/errcode"

func (c *client) EventSubscribe(*EventSubscribeRequest, Account_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
