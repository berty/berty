package bertymessenger

import (
	"context"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	weshnet_errcode "berty.tech/weshnet/pkg/errcode"
	"berty.tech/weshnet/pkg/lifecycle"
	"berty.tech/weshnet/pkg/logutil"
	"berty.tech/weshnet/pkg/protocoltypes"
	"berty.tech/weshnet/pkg/tyber"
)

func (svc *service) manageSubscriptions() {
	logger := svc.logger.Named("sub")

	subscribe := func() {
		svc.logger.Info("starting group subscription")

		svc.subsMutex.Lock()
		defer svc.subsMutex.Unlock()

		if svc.cancelSubsCtx != nil {
			logger.Error("sub to known groups already running")
			return
		}

		ctx, cancel := context.WithCancel(svc.ctx)
		svc.cancelSubsCtx = cancel
		svc.subsCtx = ctx

		var tyberErr error
		tyberCtx, _, endSection := tyber.Section(context.TODO(), logger, "Subscribing to known groups")
		defer func() { endSection(tyberErr, "") }()

		// Subscribe to account group
		if err := svc.subscribeToGroup(ctx, tyberCtx, svc.accountGroup); err != nil {
			if !errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened) {
				logger.Error("unable subscribe to group", zap.String("gpk", messengerutil.B64EncodeBytes(svc.accountGroup)), zap.Error(err))
			}
			tyberErr = multierr.Append(tyberErr, err)
		}

		// subscribe to other groups
		for groupPK := range svc.groupsToSubTo {
			gpkb, err := messengerutil.B64DecodeBytes(groupPK)
			if err != nil {
				logger.Error("unable subscribe, decode error", zap.String("gpk", groupPK), zap.Error(err))
				tyberErr = multierr.Append(tyberErr, err)
				continue
			}

			if err := svc.subscribeToGroup(ctx, tyberCtx, gpkb); err != nil {
				if !errcode.Has(err, errcode.ErrBertyAccountAlreadyOpened) {
					logger.Error("unable subscribe to group", zap.String("gpk", groupPK), zap.Error(err))
				}
				tyberErr = multierr.Append(tyberErr, err)
				continue
			}

			svc.logger.Debug("subscribe to group success", zap.String("gpk", groupPK))
		}
	}

	unsubscribe := func() {
		logger.Info("closing all group subscriptions")

		svc.subsMutex.Lock()
		defer svc.subsMutex.Unlock()

		if svc.subsCtx == nil {
			return
		}

		// unsubscribe accountGroup
		if _, err := svc.protocolClient.DeactivateGroup(svc.subsCtx, &protocoltypes.DeactivateGroup_Request{
			GroupPK: svc.accountGroup,
		}); err != nil {
			if !errcode.Has(err, errcode.ErrBertyAccount) {
				logger.Error("unable to deactivate group", zap.String("gpk", messengerutil.B64EncodeBytes(svc.accountGroup)), zap.Error(err))
			}
		}

		// unsubscribe other groups
		for groupPK := range svc.groupsToSubTo {
			groupPKBytes, err := messengerutil.B64DecodeBytes(groupPK)
			if err != nil {
				logger.Error("unable to close subscriptions, decode error", zap.String("gpk", groupPK), zap.Error(err))
				continue
			}
			if _, err := svc.protocolClient.DeactivateGroup(svc.subsCtx, &protocoltypes.DeactivateGroup_Request{
				GroupPK: groupPKBytes,
			}); err != nil {
				if !errcode.Has(err, errcode.ErrBertyAccount) {
					logger.Error("unable to deactivate group", zap.String("gpk", groupPK), zap.Error(err))
				}

				continue
			}
		}

		if svc.cancelSubsCtx != nil {
			svc.cancelSubsCtx()
		}

		svc.subsCtx = nil
		svc.cancelSubsCtx = nil
	}

	// start in inactive state, which should trigger the `startSubscription`
	// method naturally when switching to active state at application startup
	currentState := lifecycle.StateInactive
	for {
		task, ok := svc.lcmanager.TaskWaitForStateChange(svc.ctx, currentState)
		if !ok {
			break // leave the loop, context has expired
		}

		// update current state
		currentState = svc.lcmanager.GetCurrentState()

		switch currentState {
		case lifecycle.StateActive:
			subscribe()
		case lifecycle.StateInactive:
			unsubscribe()
		}

		task.Done()
	}

	// if we are in any other state than inactive, close subscription
	if currentState != lifecycle.StateInactive {
		unsubscribe()
	}
}

func (svc *service) subscribeToMetadata(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	traceName := "Subscribing to metadata on group " + messengerutil.B64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Successfully subscribed to metadata")
	} else {
		tyber.LogStep(tyberCtx, svc.logger, traceName)
	}

	// subscribe
	s, err := svc.protocolClient.GroupMetadataList(
		ctx,
		&protocoltypes.GroupMetadataList_Request{GroupPK: gpkb},
	)
	if err != nil {
		return errcode.ErrEventListMetadata.Wrap(err)
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				svc.logStreamingError("group metadata", err)
				return
			}

			cid, err := ipfscid.Cast(gme.EventContext.ID)
			eventHandler := svc.eventHandler
			if err != nil {
				svc.logger.Error("failed to cast cid for logging", logutil.PrivateBinary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
				eventHandler = eventHandler.WithContext(ctx)
			} else {
				eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.HandleMetadataEvent(gme); err != nil {
				_ = tyber.LogFatalError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle protocol event", err)
			} else {
				eventHandler.Logger().Debug("Messenger event handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

func (svc *service) subscribeToMessages(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	traceName := "Subscribing to messages on group " + messengerutil.B64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Successfully subscribed to messages")
	} else {
		tyber.LogStep(tyberCtx, svc.logger, traceName)
	}

	ms, err := svc.protocolClient.GroupMessageList(
		ctx,
		&protocoltypes.GroupMessageList_Request{
			GroupPK:  gpkb,
			SinceNow: true,
		},
	)
	if err != nil {
		return errcode.ErrEventListMessage.Wrap(err)
	}
	go func() {
		for {
			gme, err := ms.Recv()
			if err != nil {
				svc.logStreamingError("group message", err)
				return
			}

			var am mt.AppMessage
			if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
				svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
				return
			}

			cid, err := ipfscid.Cast(gme.EventContext.ID)
			eventHandler := svc.eventHandler
			if err != nil {
				svc.logger.Error("failed to cast cid for logging", zap.String("type", am.GetType().String()), logutil.PrivateBinary("cid-bytes", gme.EventContext.ID))
				ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
				eventHandler = eventHandler.WithContext(ctx)
			} else {
				eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
			}

			svc.handlerMutex.Lock()
			if err := eventHandler.HandleAppMessage(messengerutil.B64EncodeBytes(gpkb), gme, &am); err != nil {
				_ = tyber.LogFatalError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle AppMessage", err)
			} else {
				eventHandler.Logger().Debug("AppMessage handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
			}
			svc.handlerMutex.Unlock()
		}
	}()
	return nil
}

func (svc *service) subscribeToGroup(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	if newTrace {
		svc.logger.Debug("Subscribing to group "+messengerutil.B64EncodeBytes(gpkb), tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Successfully subscribed to group")
	}

	if _, err := svc.protocolClient.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: gpkb,
	}); err != nil {
		return weshnet_errcode.ErrGroupActivate.Wrap(err)
	}

	if err := svc.subscribeToMetadata(ctx, tyberCtx, gpkb); err != nil {
		return err
	}

	return svc.subscribeToMessages(ctx, tyberCtx, gpkb)
}
