package bertyprotocol

import (
	"berty.tech/berty/go/pkg/errcode"
)

// GroupMetadataSubscribe subscribes to the metadata events for a group
func (c *service) GroupMetadataSubscribe(*GroupMetadataSubscribe_Request, ProtocolService_GroupMetadataSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// GroupMessageSubscribe subscribes to the message events for a group
func (c *service) GroupMessageSubscribe(*GroupMessageSubscribe_Request, ProtocolService_GroupMessageSubscribeServer) error {
	return errcode.ErrNotImplemented
}
