package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) AccountSettingsGet(context.Context, *AccountSettingsGetRequest) (*AccountSettingsGetReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) AccountSettingsUpdate(context.Context, *AccountSettingsUpdateRequest) (*AccountSettingsUpdateReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) AccountPairingInvitationCreate(context.Context, *AccountPairingInvitationCreateRequest) (*AccountPairingInvitationCreateReply, error) {
	return nil, errcode.ErrChatNotImplemented
}

func (c *client) AccountRenewIncomingContactRequestLink(context.Context, *AccountRenewIncomingContactRequestLinkRequest) (*AccountRenewIncomingContactRequestLinkReply, error) {
	return nil, errcode.ErrChatNotImplemented
}
