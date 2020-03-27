package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (c *service) GroupInfo(_ context.Context, req *GroupInfo_Request) (*GroupInfo_Reply, error) {
	var (
		g   *Group
		err error
	)

	if req.GroupPK != nil {
		pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = c.getGroupForPK(pk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	} else if req.ContactPK != nil {
		pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = c.getContactGroup(pk)
		if err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}
	} else {
		return nil, errcode.ErrInvalidInput
	}

	md, err := c.account.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	member, err := md.Member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := md.Device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &GroupInfo_Reply{
		Group:    g,
		MemberPK: member,
		DevicePK: device,
	}, nil
}

func (c *service) ActivateGroup(ctx context.Context, req *ActivateGroup_Request) (*ActivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if _, err := c.activateGroup(ctx, pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &ActivateGroup_Reply{}, nil
}

func (c *service) DeactivateGroup(_ context.Context, req *DeactivateGroup_Request) (*DeactivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if err := c.deactivateGroup(pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &DeactivateGroup_Reply{}, nil
}
