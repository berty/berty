package node

import (
	"context"
	"encoding/json"
	"fmt"
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

// HandleEvent implements berty.p2p.HandleEvent (synchronous unary)
func (n *Node) HandleEvent(ctx context.Context, input *p2p.Event) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	return &node.Void{}, n.handleEvent(ctx, input)
}

func (n *Node) handleEvent(ctx context.Context, input *p2p.Event) error {
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
	if err := sql.Model(&p2p.Event{}).Where(&p2p.Event{ID: input.ID, SenderID: input.SenderID}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("event already handled")
	}

	now := time.Now().UTC()
	input.Direction = p2p.Event_Incoming   // set direction to incoming
	input.ReceivedAt = &now                // set current date
	input.ReceiverAPIVersion = p2p.Version // it's important to keep our current version to be able to apply per-message migrations in the future
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

	handler, found := map[p2p.Kind]EventHandler{
		p2p.Kind_ContactRequest:         n.handleContactRequest,
		p2p.Kind_ContactRequestAccepted: n.handleContactRequestAccepted,
		p2p.Kind_ContactShareMe:         n.handleContactShareMe,
		p2p.Kind_ConversationInvite:     n.handleConversationInvite,
		p2p.Kind_ConversationNewMessage: n.handleConversationNewMessage,
		p2p.Kind_ConversationRead:       n.handleConversationRead,
		p2p.Kind_DevtoolsMapset:         n.handleDevtoolsMapset,
		p2p.Kind_SenderAliasUpdate:      n.handleSenderAliasUpdate,
		p2p.Kind_Ack:                    n.handleAck,
		p2p.Kind_Seen:                   n.handleSeen,
		p2p.Kind_DevicePushTo:           n.handleDevicePushTo,
	}[input.Kind]
	var handlingError error
	if !found {
		handlingError = errorcodes.ErrUnimplemented.New()
	} else {
		handlingError = handler(ctx, input)
	}

	if input.Kind == p2p.Kind_Ack {
		return handlingError
	}

	// emits the event to the client (UI)
	if handlingError == nil {
		if err := n.EnqueueClientEvent(ctx, input); err != nil {
			return err
		}
	} else {
		n.LogBackgroundError(ctx, errors.Wrap(handlingError, "p2p.Handle event"))
	}

	if err := sql.Save(input).Error; err != nil {
		return errorcodes.ErrDbUpdate.Wrap(err)
	}

	// asynchronously ack, maybe we can ignore this one?
	ack := n.NewContactEvent(ctx, &entity.Contact{ID: input.SenderID}, p2p.Kind_Ack)
	ack.AckedAt = &now
	if err := ack.SetAttrs(&p2p.AckAttrs{IDs: []string{input.ID}}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(ctx, ack); err != nil {
		return err
	}

	input.AckedAt = &now

	if err := sql.Save(input).Error; err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}

	return handlingError
}
