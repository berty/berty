package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) AccountGetConfiguration(context.Context, *AccountGetConfigurationRequest) (*AccountGetConfigurationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountGetInformation(ctx context.Context, req *AccountGetInformationRequest) (*AccountGetInformationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountLinkNewDevice(context.Context, *AccountLinkNewDeviceRequest) (*AccountLinkNewDeviceReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountDisableIncomingContactRequest(context.Context, *AccountDisableIncomingContactRequestRequest) (*AccountDisableIncomingContactRequestReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountEnableIncomingContactRequest(context.Context, *AccountEnableIncomingContactRequestRequest) (*AccountEnableIncomingContactRequestReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountResetIncomingContactRequestLink(context.Context, *AccountResetIncomingContactRequestLinkRequest) (*AccountResetIncomingContactRequestLinkReply, error) {
	return nil, errcode.ErrNotImplemented
}
