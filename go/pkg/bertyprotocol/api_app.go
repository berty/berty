package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) AppMetadataSend(ctx context.Context, req *bertytypes.AppMetadataSend_Request) (*bertytypes.AppMetadataSend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MetadataStore().SendAppMetadata(ctx, req.Payload); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.AppMetadataSend_Reply{}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *bertytypes.AppMessageSend_Request) (*bertytypes.AppMessageSend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MessageStore().AddMessage(ctx, req.Payload); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &bertytypes.AppMessageSend_Reply{}, nil
}
