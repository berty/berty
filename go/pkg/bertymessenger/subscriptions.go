package bertymessenger

import (
	"context"

	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	weshnet_errcode "berty.tech/weshnet/v2/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/lifecycle"
	"berty.tech/weshnet/v2/pkg/logutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/tyber"
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
			if !errcode.Has(err, errcode.ErrCode_ErrBertyAccountAlreadyOpened) {
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
				if !errcode.Has(err, errcode.ErrCode_ErrBertyAccountAlreadyOpened) {
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
			GroupPk: svc.accountGroup,
		}); err != nil {
			if !errcode.Has(err, errcode.ErrCode_ErrBertyAccount) {
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
				GroupPk: groupPKBytes,
			}); err != nil {
				if !errcode.Has(err, errcode.ErrCode_ErrBertyAccount) {
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

// Subscription startup schedules a worker; opening the RPC is asynchronous so
// initial failures can retry without blocking lifecycle changes under subsMutex.
func (svc *service) subscribeToMetadata(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	traceName := "Subscribing to metadata on group " + messengerutil.B64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Started metadata subscription")
	} else {
		tyber.LogStep(tyberCtx, svc.logger, traceName)
	}

	if err := ctx.Err(); err != nil {
		return errcode.ErrCode_ErrEventListMetadata.Wrap(err)
	}
	go runSubscription(ctx, svc.subscriptionLogger("metadata", gpkb), nil,
		func(ctx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[*protocoltypes.GroupMetadataEvent], error) {
			return svc.connectGroupMetadata(ctx, gpkb, sinceID, untilNow)
		}, svc.handleGroupMetadataEvent)
	return nil
}

func (svc *service) subscribeToMessages(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	traceName := "Subscribing to messages on group " + messengerutil.B64EncodeBytes(gpkb)
	if newTrace {
		svc.logger.Debug(traceName, tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Started message subscription")
	} else {
		tyber.LogStep(tyberCtx, svc.logger, traceName)
	}

	if err := ctx.Err(); err != nil {
		return errcode.ErrCode_ErrEventListMessage.Wrap(err)
	}
	cursor := svc.lastIndexedMessageCursor(gpkb)
	go runSubscription(ctx, svc.subscriptionLogger("messages", gpkb), cursor,
		func(ctx context.Context, sinceID []byte, untilNow bool) (subscriptionStream[*protocoltypes.GroupMessageEvent], error) {
			return svc.connectGroupMessages(ctx, gpkb, sinceID, untilNow)
		}, func(event *protocoltypes.GroupMessageEvent) error {
			return svc.handleGroupMessageEvent(gpkb, event)
		})
	return nil
}

func (svc *service) subscriptionLogger(kind string, gpkb []byte) *zap.Logger {
	return svc.logger.With(zap.String("subscription", kind),
		logutil.PrivateString("group-pk", messengerutil.B64EncodeBytes(gpkb)))
}

func (svc *service) connectGroupMetadata(ctx context.Context, gpkb, sinceID []byte, untilNow bool) (subscriptionStream[*protocoltypes.GroupMetadataEvent], error) {
	return svc.protocolClient.GroupMetadataList(ctx, &protocoltypes.GroupMetadataList_Request{
		GroupPk: gpkb, SinceId: sinceID, UntilNow: untilNow,
	})
}

func (svc *service) connectGroupMessages(ctx context.Context, gpkb, sinceID []byte, untilNow bool) (subscriptionStream[*protocoltypes.GroupMessageEvent], error) {
	return svc.protocolClient.GroupMessageList(ctx, &protocoltypes.GroupMessageList_Request{
		GroupPk: gpkb, SinceId: sinceID, UntilNow: untilNow,
	})
}

func (svc *service) handleGroupMetadataEvent(gme *protocoltypes.GroupMetadataEvent) error {
	cid, err := ipfscid.Cast(gme.GetEventContext().GetId())
	eventHandler := svc.eventHandler
	if err != nil {
		svc.logger.Error("failed to cast cid for logging", logutil.PrivateBinary("cid-bytes", gme.GetEventContext().GetId()))
		ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
		eventHandler = eventHandler.WithContext(ctx)
	} else {
		eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
	}

	svc.handlerMutex.Lock()
	defer svc.handlerMutex.Unlock()
	if err := eventHandler.HandleMetadataEvent(gme); err != nil {
		return tyber.LogError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle protocol event", err)
	}
	eventHandler.Logger().Debug("Messenger event handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
	return nil
}

// lastIndexedMessageCursor returns the log id of the group's most recent stored
// interaction (nil when none or on error, so history is replayed from the start).
func (svc *service) lastIndexedMessageCursor(gpkb []byte) []byte {
	interactions, err := svc.db.GetPaginatedInteractions(&mt.PaginatedInteractionsOptions{
		ConversationPk: messengerutil.B64EncodeBytes(gpkb),
		Amount:         1,
	})
	if err != nil || len(interactions) == 0 {
		return nil
	}

	// Interaction.Cid is ipfscid.Cast(EventContext.Id).String(); rebuild the bytes.
	cid, err := ipfscid.Decode(interactions[0].GetCid())
	if err != nil {
		return nil
	}
	return cid.Bytes()
}

// handleGroupMessageEvent decodes one event and dispatches it; decoding failures are skipped, not fatal.
func (svc *service) handleGroupMessageEvent(gpkb []byte, gme *protocoltypes.GroupMessageEvent) error {
	var am mt.AppMessage
	if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
		svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
		return nil // Malformed payloads cannot be repaired by retrying.
	}

	cid, err := ipfscid.Cast(gme.EventContext.Id)
	eventHandler := svc.eventHandler
	if err != nil {
		svc.logger.Error("failed to cast cid for logging", zap.String("type", am.GetType().String()), logutil.PrivateBinary("cid-bytes", gme.EventContext.Id))
		ctx, _ := tyber.ContextWithTraceID(svc.eventHandler.Ctx())
		eventHandler = eventHandler.WithContext(ctx)
	} else {
		eventHandler = eventHandler.WithContext(tyber.ContextWithConstantTraceID(svc.eventHandler.Ctx(), "msgrcvd-"+cid.String()))
	}

	if err := eventHandler.HandleAppMessage(messengerutil.B64EncodeBytes(gpkb), gme, &am); err != nil {
		return tyber.LogError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle AppMessage", err)
	}
	eventHandler.Logger().Debug("AppMessage handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
	return nil
}

func (svc *service) subscribeToGroup(ctx, tyberCtx context.Context, gpkb []byte) error {
	tyberCtx, newTrace := tyber.ContextWithTraceID(tyberCtx)
	if newTrace {
		svc.logger.Debug("Subscribing to group "+messengerutil.B64EncodeBytes(gpkb), tyber.FormatTraceLogFields(tyberCtx)...)
		defer tyber.LogTraceEnd(tyberCtx, svc.logger, "Successfully subscribed to group")
	}

	if _, err := svc.protocolClient.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPk: gpkb,
	}); err != nil {
		return weshnet_errcode.ErrCode_ErrGroupActivate.Wrap(err)
	}

	if err := svc.subscribeToMetadata(ctx, tyberCtx, gpkb); err != nil {
		return err
	}

	return svc.subscribeToMessages(ctx, tyberCtx, gpkb)
}
