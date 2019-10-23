package bertychat

import (
	"context"

	"berty.tech/go/internal/chaterrcode"
)

func (c *client) AccountSettingsGet(context.Context, *AccountSettingsGetRequest) (*AccountSettingsGetReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) AccountSettingsUpdate(context.Context, *AccountSettingsUpdateRequest) (*AccountSettingsUpdateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) AccountPairingInvitationCreate(context.Context, *AccountPairingInvitationCreateRequest) (*AccountPairingInvitationCreateReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}

func (c *client) AccountRenewIncomingContactRequestLink(context.Context, *AccountRenewIncomingContactRequestLinkRequest) (*AccountRenewIncomingContactRequestLinkReply, error) {
	return nil, chaterrcode.ErrNotImplemented
}
