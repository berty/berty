package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (c *client) InstanceExportData(context.Context, *bertytypes.InstanceExportData_Request) (*bertytypes.InstanceExportData_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) InstanceGetConfiguration(ctx context.Context, req *bertytypes.InstanceGetConfiguration_Request) (*bertytypes.InstanceGetConfiguration_Reply, error) {
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

	return &bertytypes.InstanceGetConfiguration_Reply{
		AccountPK:      member,
		DevicePK:       device,
		AccountGroupPK: c.accContextGroup.Group().PublicKey,
		PeerID:         key.ID().Pretty(),
		Listeners:      listeners,
	}, nil
}
