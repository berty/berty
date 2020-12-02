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

	op, err := g.MetadataStore().SendAppMetadata(ctx, req.Payload, req.GetAttachmentCIDs())
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMetadataSend_Reply{
		CID: op.GetEntry().GetHash().Bytes(),
	}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *protocoltypes.AppMessageSend_Request) (*protocoltypes.AppMessageSend_Reply, error) {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}

	op, err := g.MessageStore().AddMessage(ctx, req.Payload, req.GetAttachmentCIDs())
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMessageSend_Reply{
		CID: op.GetEntry().GetHash().Bytes(),
	}, nil
}
