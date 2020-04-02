package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (s *service) GroupInfo(_ context.Context, req *bertytypes.GroupInfo_Request) (*bertytypes.GroupInfo_Reply, error) {
	var (
		g   *bertytypes.Group
		err error
	)

	switch {
	case req.GroupPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getGroupForPK(pk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	case req.ContactPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getContactGroup(pk)
		if err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}
	default:
		return nil, errcode.ErrInvalidInput
	}

	md, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	member, err := md.member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := md.device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertytypes.GroupInfo_Reply{
		Group:    g,
		MemberPK: member,
		DevicePK: device,
	}, nil
}

func (s *service) ActivateGroup(ctx context.Context, req *bertytypes.ActivateGroup_Request) (*bertytypes.ActivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	err = s.activateGroup(pk)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &bertytypes.ActivateGroup_Reply{}, nil
}

func (s *service) DeactivateGroup(_ context.Context, req *bertytypes.DeactivateGroup_Request) (*bertytypes.DeactivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if err := s.deactivateGroup(pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &bertytypes.DeactivateGroup_Reply{}, nil
}
