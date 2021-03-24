package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) AppMetadataSend(ctx context.Context, req *protocoltypes.AppMetadataSend_Request) (*protocoltypes.AppMetadataSend_Reply, error) {
	ctx = tyber.ContextWithTraceID(ctx)
	s.logger.Info(
		fmt.Sprintf("Sending metadata to group %s", hex.EncodeToString(req.GroupPK)),
		tyber.FormatTraceLogFields(ctx)...,
	)

	gc, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		s.logger.Error(
			"Getting Group Context failed",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}
	s.logger.Debug(
		"Getting Group Context succeeded",
		tyber.FormatStepLogFields(
			ctx,
			[]tyber.Detail{{Name: "Group Type", Description: gc.Group().GetGroupType().String()}},
			tyber.Succeeded,
			false,
		)...,
	)

	if _, err := gc.MetadataStore().SendAppMetadata(ctx, req.Payload, req.GetAttachmentCIDs()); err != nil {
		s.logger.Error(
			"Writing metadata on metadata store failed",
			tyber.FormatStepLogFields(
				ctx,
				[]tyber.Detail{{Name: "Error", Description: err.Error()}},
				tyber.Failed,
				true,
			)...,
		)
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}
	s.logger.Debug(
		"ToDo: catch Tinder event to display related connected peers",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, false)...,
	)
	s.logger.Debug(
		"ToDo: catch acknowledge event to confirm message reception",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, true)...,
	)

	return &protocoltypes.AppMetadataSend_Reply{}, nil
}

func (s *service) AppMessageSend(ctx context.Context, req *protocoltypes.AppMessageSend_Request) (*protocoltypes.AppMessageSend_Reply, error) {
	ctx = tyber.ContextWithTraceID(ctx)
	s.logger.Info(
		fmt.Sprintf("Sending message to group %s", hex.EncodeToString(req.GroupPK)),
		tyber.FormatTraceLogFields(ctx)...,
	)

	gc, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		s.logger.Error(
			"Getting Group Context failed",
			tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "Error", Description: err.Error()}}, tyber.Failed, true)...,
		)
		return nil, errcode.ErrGroupMissing.Wrap(err)
	}
	s.logger.Debug(
		"Getting Group Context succeeded",
		tyber.FormatStepLogFields(
			ctx,
			[]tyber.Detail{{Name: "Group Type", Description: gc.Group().GetGroupType().String()}},
			tyber.Succeeded,
			false,
		)...,
	)
	op, err := gc.MessageStore().AddMessage(ctx, req.Payload, req.GetAttachmentCIDs())
	if err != nil {
		s.logger.Error(
			"Writing metadata on metadata store failed",
			tyber.FormatStepLogFields(
				ctx,
				[]tyber.Detail{{Name: "Error", Description: err.Error()}},
				tyber.Failed,
				true,
			)...,
		)
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}
	s.logger.Debug(
		"ToDo: catch Tinder event to display related connected peers",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, false)...,
	)
	s.logger.Debug(
		"ToDo: catch acknowledge event to confirm message reception",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.Succeeded, true)...,
	)

	return &protocoltypes.AppMessageSend_Reply{CID: op.GetEntry().GetHash().Bytes()}, nil
}
