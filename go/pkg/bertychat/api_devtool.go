package bertychat

import "berty.tech/go/internal/chaterrcode"

func (c *client) DevEventSubscribe(*DevEventSubscribeRequest, Account_DevEventSubscribeServer) error {
	return chaterrcode.ErrNotImplemented
}
