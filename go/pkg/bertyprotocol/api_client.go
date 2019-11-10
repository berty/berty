package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) InstanceExportData(context.Context, *InstanceExportDataRequest) (*InstanceExportDataReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) InstanceGetConfiguration(ctx context.Context, req *InstanceGetConfigurationRequest) (*InstanceGetConfigurationReply, error) {
	ret := &InstanceGetConfigurationReply{}

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
