package bertyprotocol

import (
	"context"
	"encoding/base64"
	"fmt"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) AppMetadataSend(ctx context.Context, req *protocoltypes.AppMetadataSend_Request) (_ *protocoltypes.AppMetadataSend_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, fmt.Sprintf("Sending app metadata to group %s", base64.RawURLEncoding.EncodeToString(req.GroupPK)))
	defer func() { endSection(err, "") }()

	gc, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}
	tyberLogGroupContext(ctx, s.logger, gc)

	op, err := gc.MetadataStore().SendAppMetadata(ctx, req.Payload, req.GetAttachmentCIDs())
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMetadataSend_Reply{CID: op.GetEntry().GetHash().Bytes()}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *protocoltypes.AppMessageSend_Request) (_ *protocoltypes.AppMessageSend_Reply, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, fmt.Sprintf("Sending message to group %s", base64.RawURLEncoding.EncodeToString(req.GroupPK)))
	defer func() { endSection(err, "") }()

	gc, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}
	tyberLogGroupContext(ctx, s.logger, gc)

	op, err := gc.MessageStore().AddMessage(ctx, req.Payload, req.GetAttachmentCIDs())
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	return &protocoltypes.AppMessageSend_Reply{CID: op.GetEntry().GetHash().Bytes()}, nil
}

func tyberLogGroupContext(ctx context.Context, logger *zap.Logger, gc *GroupContext) {
	memberPK, err := gc.MemberPubKey().Raw()
	if err != nil {
		memberPK = []byte{}
	}

	logger.Debug("Got group context", tyber.FormatStepLogFields(ctx, []tyber.Detail{
		{Name: "GroupType", Description: gc.Group().GetGroupType().String()},
		{Name: "GroupPK", Description: base64.RawURLEncoding.EncodeToString(gc.Group().PublicKey)},
		{Name: "MemberPK", Description: base64.RawURLEncoding.EncodeToString(memberPK)},
	})...)
}
