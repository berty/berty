package bertyprotocol

import "berty.tech/go/internal/protocolerrcode"

func (c *client) EventSubscribe(*EventSubscribeRequest, Instance_EventSubscribeServer) error {
	return protocolerrcode.ErrNotImplemented
}
