package bertyprotocol

import "berty.tech/go/pkg/errcode"

func (c *client) EventSubscribe(*EventSubscribeRequest, Instance_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
