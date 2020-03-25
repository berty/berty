package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *client) InstanceExportData(context.Context, *InstanceExportData_Request) (*InstanceExportData_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) InstanceGetConfiguration(ctx context.Context, req *InstanceGetConfiguration_Request) (*InstanceGetConfiguration_Reply, error) {
	key, err := c.ipfsCoreAPI.Key().Self(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	maddrs, err := c.ipfsCoreAPI.Swarm().ListenAddrs(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	listeners := make([]string, len(maddrs))
	for i, addr := range maddrs {
		listeners[i] = addr.String()
	}

	member, err := c.accContextGroup.MemberPubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := c.accContextGroup.DevicePubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &InstanceGetConfiguration_Reply{
		AccountPK:      member,
		DevicePK:       device,
		AccountGroupPK: c.accContextGroup.Group().PublicKey,
		PeerID:         key.ID().Pretty(),
		Listeners:      listeners,
	}, nil
}
