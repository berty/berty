package bertyprotocol

import "berty.tech/go/pkg/errcode"

func (c *client) EventSubscribe(*EventSubscribe_Request, ProtocolService_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}
