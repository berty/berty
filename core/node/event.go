package node

import (
	"context"
	"encoding/json"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (n *Node) AsyncWait(ctx context.Context) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	n.asyncWaitGroupInst.Wait()
}

// HandleEvent implements berty.entity.HandleEvent (synchronous unary)
func (n *Node) HandleEvent(ctx context.Context, input *entity.Event) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	return &node.Void{}, n.handleEvent(ctx, input)
}

func (n *Node) handleEvent(ctx context.Context, input *entity.Event) error {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()
	n.handleMutex(ctx)()

	if input.SenderID == n.UserID() {
		logger().Debug("skipping event created by myself",
			zap.String("sender", input.SenderID),
			zap.String("id", input.ID),
		)
		return nil
	}

	var count int
	sql := n.sql(ctx)
	if err := sql.Model(&entity.Event{}).Where(&entity.Event{ID: input.ID, SenderID: input.SenderID}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		err := errors.New("event already handled")
		logger().Warn(err.Error())
		return err
	}

	now := time.Now().UTC()
	input.Direction = entity.Event_Incoming // set direction to incoming
	input.ReceivedAt = &now                 // set current date
	input.ReceiverAPIVersion = p2p.Version  // it's important to keep our current version to be able to apply per-message migrations in the future
	// input.ReceiverID = ""               // we should be able to remove this information

	// debug
	if ce := logger().Check(zap.DebugLevel, "handle event"); ce != nil {
		var event string
		if out, err := json.Marshal(input); err == nil {
			event = string(out)
		}
		ce.Write(
			zap.String("sender", input.SenderID),
			zap.String("id", input.ID),
			zap.String("event", event),
		)
	}

	handler, found := map[entity.Kind]EventHandler{
		entity.Kind_ContactRequest:         n.handleContactRequest,
		entity.Kind_ContactRequestAccepted: n.handleContactRequestAccepted,
		entity.Kind_ContactShareMe:         n.handleContactShareMe,
		entity.Kind_ConversationInvite:     n.handleConversationInvite,
		entity.Kind_ConversationNewMessage: n.handleConversationNewMessage,
		entity.Kind_ConversationRead:       n.handleConversationRead,
		entity.Kind_DevtoolsMapset:         n.handleDevtoolsMapset,
		entity.Kind_SenderAliasUpdate:      n.handleSenderAliasUpdate,
		entity.Kind_Ack:                    n.handleAck,
		entity.Kind_Seen:                   n.handleSeen,
		entity.Kind_DevicePushTo:           n.handleDevicePushTo,
		entity.Kind_DeviceUpdatePushConfig: n.handleDeviceUpdatePushConfig,
	}[input.Kind]
	var handlingError error
	if !found {
		handlingError = errorcodes.ErrUnimplemented.New()
	} else {
		handlingError = handler(ctx, input)
	}

	if input.Kind == entity.Kind_Ack {
		return handlingError
	}

	// emits the event to the client (UI)
	if handlingError == nil {
		if err := n.EnqueueClientEvent(ctx, input); err != nil {
			return err
		}
	} else {
		n.LogBackgroundError(ctx, errors.Wrap(handlingError, "entity.Handle event"))
	}

	if input.Kind != entity.Kind_DevicePushTo {
		if err := sql.Save(input).Error; err != nil {
			return errorcodes.ErrDbUpdate.Wrap(err)
		}
	}

	// asynchronously ack, maybe we can ignore this one?
	ack := n.NewContactEvent(ctx, &entity.Contact{ID: input.SenderID}, entity.Kind_Ack)
	ack.AckedAt = &now
	if err := ack.SetAttrs(&entity.AckAttrs{IDs: []string{input.ID}}); err != nil {
		return err
	}

	if err := n.EnqueueOutgoingEvent(ctx, ack, &OutgoingEventOptions{DisableEventLogging: input.Kind == entity.Kind_DevicePushTo}); err != nil {
		return err
	}

	input.AckedAt = &now

	if err := sql.Save(input).Error; err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}

	return handlingError
}
