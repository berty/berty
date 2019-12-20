package bertyprotocol

import "berty.tech/go/pkg/errcode"

// AccountSubscribe subscribes to the account events
func (c *client) AccountSubscribe(*AccountSubscribe_Request, ProtocolService_AccountSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// GroupSettingSubscribe subscribes to the setting events for a group
func (c *client) GroupSettingSubscribe(*GroupSettingStoreSubscribe_Request, ProtocolService_GroupSettingSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// GroupMessageSubscribe subscribes to the message events for a group
func (c *client) GroupMessageSubscribe(*GroupMessageSubscribe_Request, ProtocolService_GroupMessageSubscribeServer) error {
	return errcode.ErrNotImplemented
}

// GroupMemberSubscribe subscribes to the member events for a group
func (c *client) GroupMemberSubscribe(*GroupMemberSubscribe_Request, ProtocolService_GroupMemberSubscribeServer) error {
	return errcode.ErrNotImplemented
}
