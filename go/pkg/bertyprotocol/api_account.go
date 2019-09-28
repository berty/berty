package bertyprotocol

import context "context"

func (c *client) AccountGetConfiguration(context.Context, *AccountGetConfigurationRequest) (*AccountGetConfigurationReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) AccountGetInformation(context.Context, *AccountGetInformationRequest) (*AccountGetInformationReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) AccountLinkNewDevice(context.Context, *AccountLinkNewDeviceRequest) (*AccountLinkNewDeviceReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) AccountDisableIncomingContactRequest(context.Context, *AccountDisableIncomingContactRequestRequest) (*AccountDisableIncomingContactRequestReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) AccountEnableIncomingContactRequest(context.Context, *AccountEnableIncomingContactRequestRequest) (*AccountEnableIncomingContactRequestReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) AccountResetIncomingContactRequestLink(context.Context, *AccountResetIncomingContactRequestLinkRequest) (*AccountResetIncomingContactRequestLinkReply, error) {
	return nil, ErrNotImplemented
}
