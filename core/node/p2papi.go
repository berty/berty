package node

import (
	"context"
	"encoding/json"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/pkg/errors"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

// Handle implements berty.p2p.Handle (synchronous unary)
func (n *Node) Handle(ctx context.Context, input *p2p.Event) (*p2p.Void, error) {
	return &p2p.Void{}, n.handle(ctx, input)
}

func (n *Node) handle(ctx context.Context, input *p2p.Event) error {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if input.SenderID != p2p.GetSender(ctx) {
		return ErrInvalidEventSender
	}

	now := time.Now()
	input.Direction = p2p.Event_Incoming   // set direction to incoming
	input.ReceivedAt = &now                // set current date
	input.ReceiverAPIVersion = p2p.Version // it's important to keep our current version to be able to apply per-message migrations in the future
	// input.ReceiverID = ""               // we should be able to remove this information

	// debug
	// FIXME: check if logger is in debug mode
	out, err := json.Marshal(input)
	if err == nil {
		zap.L().Debug("handle event",
			zap.String("sender", p2p.GetSender(ctx)),
			zap.String("event", string(out)),
		)
	}

	if input.Kind == p2p.Kind_Ack {
		// FIXME: update acked_at in db
		return nil
	}

	handler, found := map[p2p.Kind]EventHandler{
		p2p.Kind_ContactRequest:         n.handleContactRequest,
		p2p.Kind_ContactRequestAccepted: n.handleContactRequestAccepted,
		p2p.Kind_ContactShareMe:         n.handleContactShareMe,
		p2p.Kind_ConversationInvite:     n.handleConversationInvite,
	}[input.Kind]
	var handlingError error
	if !found {
		handlingError = ErrNotImplemented
	} else {
		handlingError = handler(ctx, input)
	}

	// emits the event to the client (UI)
	if handlingError == nil {
		if err := n.EnqueueClientEvent(input); err != nil {
			return err
		}
	} else {
		zap.L().Error("p2p.Handle event", zap.Error(handlingError))
	}

	if err := n.sql.Save(input).Error; err != nil {
		return errors.Wrap(err, "failed to save event in db")
	}

	// asynchronously ack, maybe we can ignore this one?
	ack := n.NewContactEvent(&entity.Contact{ID: input.SenderID}, p2p.Kind_Ack)
	if err := ack.SetAttrs(&p2p.AckAttrs{IDs: []string{input.ID}}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(ack); err != nil {
		return err
	}
	return handlingError
}
