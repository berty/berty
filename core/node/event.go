package node

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

func (n *Node) AsyncWait() {
	n.asyncWaitGroup.Wait()
}

// HandleEvent implements berty.p2p.HandleEvent (synchronous unary)
func (n *Node) HandleEvent(ctx context.Context, input *p2p.Event) (*node.Void, error) {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	err := n.handleEvent(ctx, input)
	//time.Sleep(100 * time.Millisecond)
	return &node.Void{}, err
}

func (n *Node) handleEvent(ctx context.Context, input *p2p.Event) error {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if input.SenderID == n.UserID() {
		logger().Debug("skipping event created by myself",
			zap.String("sender", input.SenderID),
			zap.String("id", input.ID),
		)
		return nil
	}

	var count int
	if err := n.sql.Model(&p2p.Event{}).Where(&p2p.Event{ID: input.ID, SenderID: input.SenderID}).Count(&count).Error; err != nil {
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
		p2p.Kind_DevtoolsMapset:         n.handleDevtoolsMapset,
		p2p.Kind_SenderAliasUpdate:      n.handleSenderAliasUpdate,
		p2p.Kind_Ack:                    n.handleAck,
	}[input.Kind]
	var handlingError error
	if !found {
		handlingError = ErrNotImplemented
	} else {
		handlingError = handler(ctx, input)
	}

	if input.Kind == p2p.Kind_Ack {
		return handlingError
	}

	// emits the event to the client (UI)
	if handlingError == nil {
		if err := n.EnqueueClientEvent(input); err != nil {
			return err
		}
	} else {
		n.LogBackgroundError(errors.Wrap(handlingError, "p2p.Handle event"))
	}

	if err := n.sql.Save(input).Error; err != nil {
		return errors.Wrap(err, "failed to save event in db")
	}

	// asynchronously ack, maybe we can ignore this one?
	ack := n.NewContactEvent(&entity.Contact{ID: input.SenderID}, p2p.Kind_Ack)
	ack.AckedAt = &now
	if err := ack.SetAttrs(&p2p.AckAttrs{IDs: []string{input.ID}}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(ack); err != nil {
		return err
	}

	input.AckedAt = &now

	if err := n.sql.Save(input).Error; err != nil {
		return errors.Wrap(err, "failed to save event acked at in db")
	}

	return handlingError
}
