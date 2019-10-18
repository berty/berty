package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) AccountGetConfiguration(context.Context, *AccountGetConfigurationRequest) (*AccountGetConfigurationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) AccountGetInformation(ctx context.Context, req *AccountGetInformationRequest) (*AccountGetInformationReply, error) {
	ret := &AccountGetInformationReply{}

	key, err := c.ipfsCoreAPI.Key().Self(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	ret.PeerID = key.ID().Pretty()

	maddrs, err := c.ipfsCoreAPI.Swarm().ListenAddrs(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	ret.Listeners = make([]string, len(maddrs))
	for i, addr := range maddrs {
		ret.Listeners[i] = addr.String()
	}

	return ret, nil
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
