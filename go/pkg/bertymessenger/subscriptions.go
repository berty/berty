package bertymessenger

import (
	"context"
	"time"

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
		&protocoltypes.GroupMetadataList_Request{GroupPk: gpkb},
	)
	if err != nil {
		return errcode.ErrCode_ErrEventListMetadata.Wrap(err)
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				svc.logStreamingError("group metadata", err)
				return
			}

			cid, err := ipfscid.Cast(gme.EventContext.Id)
			eventHandler := svc.eventHandler
			if err != nil {
				svc.logger.Error("failed to cast cid for logging", logutil.PrivateBinary("cid-bytes", gme.EventContext.Id))
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

	// Synchronous initial subscription from now; the goroutine below keeps it alive and backfills.
	ms, err := svc.protocolClient.GroupMessageList(
		ctx,
		&protocoltypes.GroupMessageList_Request{
			GroupPk:  gpkb,
			SinceNow: true,
		},
	)
	if err != nil {
		return errcode.ErrCode_ErrEventListMessage.Wrap(err)
	}

	// Seed the reconnect cursor from the last stored interaction so an early drop can still resume.
	cursor := svc.lastIndexedMessageCursor(gpkb)
	go svc.streamGroupMessages(ctx, gpkb, ms, cursor, svc.connectGroupMessages, svc.handleGroupMessageEvent)

	// One-shot startup catch-up: the live stream only tails from now, so replay any log gap once.
	go svc.reconcileGroupMessages(ctx, gpkb, cursor, svc.handleGroupMessageEvent)
	return nil
}

// reconcileGroupMessages replays the log from sinceID up to the head (bounded, no tail)
// to re-index messages missing from the DB; AddInteraction is idempotent so overlaps are no-ops.
func (svc *service) reconcileGroupMessages(ctx context.Context, gpkb, sinceID []byte, handle func(gpkb []byte, gme *protocoltypes.GroupMessageEvent)) {
	ms, err := svc.protocolClient.GroupMessageList(ctx, &protocoltypes.GroupMessageList_Request{
		GroupPk:  gpkb,
		SinceId:  sinceID, // nil => from the start of the log
		UntilNow: true,    // bounded: stop at the current head, don't tail
	})
	if err != nil {
		svc.logger.Warn("unable to reconcile group messages",
			logutil.PrivateString("group-pk", messengerutil.B64EncodeBytes(gpkb)),
			zap.Error(err))
		return
	}

	if count := svc.drainBoundedStream(gpkb, ms, handle); count > 0 {
		svc.logger.Info("reconciled group messages from log",
			logutil.PrivateString("group-pk", messengerutil.B64EncodeBytes(gpkb)),
			zap.Int("count", count))
	}
}

// drainBoundedStream handles every event of a non-tailing stream (skipping EventContext-less
// sentinels) and returns the count handled.
func (svc *service) drainBoundedStream(gpkb []byte, ms groupMessageStream, handle func(gpkb []byte, gme *protocoltypes.GroupMessageEvent)) int {
	count := 0
	for {
		gme, err := ms.Recv()
		if err != nil {
			return count
		}
		if gme.GetEventContext() == nil {
			continue
		}
		handle(gpkb, gme)
		count++
	}
}

const (
	groupMessagesMinReconnectDelay = time.Second
	groupMessagesMaxReconnectDelay = 30 * time.Second
)

// groupMessageStream is the GroupMessageList client subset used by the loop (an interface for testing).
type groupMessageStream interface {
	Recv() (*protocoltypes.GroupMessageEvent, error)
}

// groupMessageConnector opens (or reopens) the group message stream resuming
// after sinceID (nil => tail from now).
type groupMessageConnector func(ctx context.Context, gpkb, sinceID []byte) (groupMessageStream, error)

// connectGroupMessages is the production groupMessageConnector backed by the protocol client.
func (svc *service) connectGroupMessages(ctx context.Context, gpkb, sinceID []byte) (groupMessageStream, error) {
	req := &protocoltypes.GroupMessageList_Request{GroupPk: gpkb}
	if sinceID != nil {
		// Resume after the last handled message: replays the gap, then tails.
		req.SinceId = sinceID
	} else {
		// No cursor to resume from; tail from now.
		req.SinceNow = true
	}

	ms, err := svc.protocolClient.GroupMessageList(ctx, req)
	if err != nil {
		return nil, err
	}
	return ms, nil
}

// lastIndexedMessageCursor returns the log id of the group's most recent stored
// interaction (nil when none or on error, so the stream tails from now).
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

// streamGroupMessages drains the stream and reconnects on failure, resuming from the
// last received message id so messages from the outage are backfilled.
func (svc *service) streamGroupMessages(
	ctx context.Context,
	gpkb []byte,
	ms groupMessageStream,
	seedID []byte,
	connect groupMessageConnector,
	handle func(gpkb []byte, gme *protocoltypes.GroupMessageEvent),
) {
	// Id of the last received message, used as the reconnect cursor.
	lastID := seedID

	for {
		gme, err := ms.Recv()
		if err != nil {
			svc.logStreamingError("group message", err)

			// Stop for good once the subscription context is canceled.
			if ctx.Err() != nil {
				return
			}

			ms = svc.reconnectGroupMessages(ctx, gpkb, lastID, connect)
			if ms == nil {
				// context canceled while reconnecting
				return
			}
			continue
		}

		handle(gpkb, gme)

		if ec := gme.GetEventContext(); ec != nil {
			lastID = ec.GetId()
		}
	}
}

// reconnectGroupMessages reopens the stream, retrying with exponential backoff
// until it succeeds or ctx is canceled (returns nil).
func (svc *service) reconnectGroupMessages(ctx context.Context, gpkb, sinceID []byte, connect groupMessageConnector) groupMessageStream {
	delay := groupMessagesMinReconnectDelay
	for {
		if ctx.Err() != nil {
			return nil
		}

		ms, err := connect(ctx, gpkb, sinceID)
		if err == nil {
			svc.logger.Info("resubscribed to group messages",
				logutil.PrivateString("group-pk", messengerutil.B64EncodeBytes(gpkb)),
				zap.Bool("backfilling", sinceID != nil))
			return ms
		}

		svc.logger.Warn("unable to resubscribe to group messages, will retry",
			logutil.PrivateString("group-pk", messengerutil.B64EncodeBytes(gpkb)),
			zap.Duration("retry-in", delay),
			zap.Error(err))

		select {
		case <-ctx.Done():
			return nil
		case <-time.After(delay):
		}
		if delay *= 2; delay > groupMessagesMaxReconnectDelay {
			delay = groupMessagesMaxReconnectDelay
		}
	}
}

// handleGroupMessageEvent decodes one event and dispatches it; decoding failures are skipped, not fatal.
func (svc *service) handleGroupMessageEvent(gpkb []byte, gme *protocoltypes.GroupMessageEvent) {
	var am mt.AppMessage
	if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
		svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
		return
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
		_ = tyber.LogFatalError(eventHandler.Ctx(), eventHandler.Logger(), "Failed to handle AppMessage", err)
	} else {
		eventHandler.Logger().Debug("AppMessage handler succeeded", tyber.FormatStepLogFields(eventHandler.Ctx(), []tyber.Detail{}, tyber.EndTrace)...)
	}
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
