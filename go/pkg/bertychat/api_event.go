package bertychat

import "berty.tech/go/internal/chaterrcode"

func (c *client) EventSubscribe(*EventSubscribeRequest, Account_EventSubscribeServer) error {
	return chaterrcode.ErrNotImplemented
}
