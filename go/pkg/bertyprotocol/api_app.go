package bertyprotocol

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (s *service) AppMetadataSend(ctx context.Context, req *protocoltypes.AppMetadataSend_Request) (*protocoltypes.AppMetadataSend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MetadataStore().SendAppMetadata(ctx, req.Payload, req.GetAttachmentCIDs()); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMetadataSend_Reply{}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *protocoltypes.AppMessageSend_Request) (*protocoltypes.AppMessageSend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	if _, err := g.MessageStore().AddMessage(ctx, req.Payload, req.GetAttachmentCIDs()); err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMessageSend_Reply{}, nil
}
