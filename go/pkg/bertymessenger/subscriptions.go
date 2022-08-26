package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"sync/atomic"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (svc *service) manageSubscriptions() {
	sub := func() {
		svc.subsMutex.Lock()
		defer svc.subsMutex.Unlock()
		if svc.cancelSubsCtx != nil {
			svc.logger.Error("sub to known groups already running")
			return
		}
		ctx, cancel := context.WithCancel(svc.ctx)
		svc.cancelSubsCtx = cancel
		svc.subsCtx = ctx

		var tyberErr error
		tyberCtx, _, endSection := tyber.Section(context.TODO(), svc.logger, "Subscribing to known groups")
		defer func() { endSection(tyberErr, "") }()

		for groupPK := range svc.groupsToSubTo {
			gpkb, err := messengerutil.B64DecodeBytes(groupPK)
			if err != nil {
				tyberErr = multierr.Append(tyberErr, err)
				continue
			}
			if err := svc.subscribeToGroup(ctx, tyberCtx, gpkb); err != nil {
				tyberErr = multierr.Append(tyberErr, err)
				continue
			}
		}
	}

	currentState := svc.lcmanager.GetCurrentState()
	if currentState == lifecycle.StateActive {
		sub()
	}
	for {
		if !svc.lcmanager.WaitForStateChange(svc.ctx, currentState) {
			svc.closeSubscriptions()
			return
		}

		currentState = svc.lcmanager.GetCurrentState()

		switch currentState {
		case lifecycle.StateActive:
			sub()
		case lifecycle.StateInactive:
			svc.closeSubscriptions()
		}
	}
}

func (svc *service) closeSubscriptions() {
	svc.subsMutex.Lock()
	defer svc.subsMutex.Unlock()

	if svc.subsCtx == nil {
		return
	}

	for groupPK := range svc.groupsToSubTo {
		groupPKBytes, err := messengerutil.B64DecodeBytes(groupPK)
		if err != nil {
			svc.logger.Error("failed to decode group pk", zap.Error(err))
			continue
		}
		if _, err := svc.protocolClient.DeactivateGroup(svc.subsCtx, &protocoltypes.DeactivateGroup_Request{
			GroupPK: groupPKBytes,
		}); err != nil {
			svc.logger.Error("failed to deactivate group", zap.Error(err))
			continue
		}
	}

	if svc.cancelSubsCtx != nil {
		svc.cancelSubsCtx()
	}
	svc.subsCtx = nil
	svc.cancelSubsCtx = nil
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

var monitorCounter uint64

func (svc *service) subscribeToGroupMonitor(ctx context.Context, groupPK []byte) error {
	cl, err := svc.protocolClient.MonitorGroup(ctx, &protocoltypes.MonitorGroup_Request{
		GroupPK: groupPK,
	})
	if err != nil {
		return fmt.Errorf("unable to monitor group: %w", err)
	}

	go func() {
		for {
			seqid := atomic.AddUint64(&monitorCounter, 1)
			evt, err := cl.Recv()
			switch err {
			case nil:
			// everything fine
			case io.EOF:
				return
			case context.Canceled, context.DeadlineExceeded:
				svc.logger.Warn("monitoring group interrupted", zap.Error(err))
				return
			default:
				svc.logger.Error("error while monitoring group", zap.Error(err))
				return
			}

			meta := mt.AppMessage_MonitorMetadata{
				Event: evt.Event,
			}

			payload, err := proto.Marshal(&meta)
			if err != nil {
				svc.logger.Error("unable to marshal event")
				continue
			}

			cid := fmt.Sprintf("__monitor-group-%d", seqid)
			i := &mt.Interaction{
				CID:                   cid,
				Type:                  mt.AppMessage_TypeMonitorMetadata,
				ConversationPublicKey: messengerutil.B64EncodeBytes(evt.GetGroupPK()),
				Payload:               payload,
				SentDate:              messengerutil.TimestampMs(time.Now()),
			}

			err = svc.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionUpdated, &mt.StreamEvent_InteractionUpdated{Interaction: i}, true)
			if err != nil {
				svc.logger.Error("unable to dispatch monitor event")
			}
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
		return errcode.ErrGroupActivate.Wrap(err)
	}

	if svc.isGroupMonitorEnabled {
		if err := svc.subscribeToGroupMonitor(ctx, gpkb); err != nil {
			return err
		}
	}

	if err := svc.subscribeToMetadata(ctx, tyberCtx, gpkb); err != nil {
		return err
	}

	return svc.subscribeToMessages(ctx, tyberCtx, gpkb)
}
