package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) AccountGetConfiguration(context.Context, *AccountGetConfiguration_Request) (*AccountGetConfiguration_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountGetInformation(ctx context.Context, req *AccountGetInformation_Request) (*AccountGetInformation_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountLinkNewDevice(context.Context, *AccountLinkNewDevice_Request) (*AccountLinkNewDevice_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountDisableIncomingContactRequest(context.Context, *AccountDisableIncomingContactRequest_Request) (*AccountDisableIncomingContactRequest_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountEnableIncomingContactRequest(context.Context, *AccountEnableIncomingContactRequest_Request) (*AccountEnableIncomingContactRequest_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountResetIncomingContactRequestLink(context.Context, *AccountResetIncomingContactRequestLink_Request) (*AccountResetIncomingContactRequestLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
