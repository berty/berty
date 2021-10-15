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
	ctx, newTrace, endSection := tyber.Section(ctx, s.logger, fmt.Sprintf("Sending app metadata to group %s", base64.RawURLEncoding.EncodeToString(req.GroupPK)))
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

	if !newTrace {
		tyberSubscribeToTinderEvents(ctx, s.logger, gc.MetadataStore().Address().String())
	}

	return &protocoltypes.AppMetadataSend_Reply{CID: op.GetEntry().GetHash().Bytes()}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *protocoltypes.AppMessageSend_Request) (_ *protocoltypes.AppMessageSend_Reply, err error) {
	ctx, newTrace, endSection := tyber.Section(ctx, s.logger, fmt.Sprintf("Sending message to group %s", base64.RawURLEncoding.EncodeToString(req.GroupPK)))
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

	if !newTrace {
		tyberSubscribeToTinderEvents(ctx, s.logger, gc.MessageStore().Address().String())
	}

	return &protocoltypes.AppMessageSend_Reply{CID: op.GetEntry().GetHash().Bytes()}, nil
}

func tyberLogGroupContext(ctx context.Context, logger *zap.Logger, gc *GroupContext) {
	logger.Debug("Got group context", tyber.FormatStepLogFields(ctx, []tyber.Detail{
		{Name: "GroupType", Description: gc.Group().GetGroupType().String()},
	})...)
}

func tyberSubscribeToTinderEvents(ctx context.Context, logger *zap.Logger, topic string) {
	targetDetails := []tyber.Detail{{Name: "Topic", Description: topic}}
	logger.Debug("Subscribing to tinder PeerFound events", tyber.FormatSubscribeLogFields(ctx, TyberEventTinderPeerFound, targetDetails)...)
	logger.Debug("Subscribing to tinder PeerJoin events", tyber.FormatSubscribeLogFields(ctx, TyberEventTinderPeerJoined, targetDetails)...)
	logger.Debug("Subscribing to tinder PeerLeave events", tyber.FormatSubscribeLogFields(ctx, TyberEventTinderPeerLeft, targetDetails)...)
}
