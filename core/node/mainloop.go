package node

import (
	"context"
	"fmt"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/pkg/tracing"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// EventsRetry updates SentAt and requeue an event
func (n *Node) EventRequeue(ctx context.Context, event *p2p.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	sql := n.sql(ctx)

	now := time.Now()
	event.SentAt = &now
	if err := sql.Save(event).Error; err != nil {
		return errors.Wrap(err, "error while updating SentAt on event")
	}
	n.outgoingEvents <- event

	return nil
}

// EventsRetry sends events which lack an AckedAt value emitted before the supplied time value
func (n *Node) EventsRetry(ctx context.Context, before time.Time) ([]*p2p.Event, error) {
	tracer := tracing.EnterFunc(ctx, before)
	defer tracer.Finish()
	ctx = tracer.Context()

	sql := n.sql(ctx)
	var retriedEvents []*p2p.Event
	destinations, err := p2p.FindNonAcknowledgedEventDestinations(sql, before)

	if err != nil {
		return nil, err
	}

	for _, destination := range destinations {
		events, err := p2p.FindNonAcknowledgedEventsForDestination(sql, destination)

		if err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "error while retrieving events for dst"))
			continue
		}

		for _, event := range events {
			if err := n.EventRequeue(ctx, event); err != nil {
				n.LogBackgroundError(ctx, errors.Wrap(err, "error while enqueuing event"))
				continue
			}
			retriedEvents = append(retriedEvents, event)
		}
	}

	return retriedEvents, nil
}

func (n *Node) cron(ctx context.Context) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	for {
		before := time.Now().Add(-time.Second * 60 * 10)
		if _, err := n.EventsRetry(ctx, before); err != nil {
			n.LogBackgroundError(ctx, err)
		}

		time.Sleep(time.Second * 60)
	}
}

func (n *Node) handleClientEvent(ctx context.Context, event *p2p.Event) {
	logger().Debug("client event", zap.Stringer("event", event))

	// @FIXME: Don't create a span here for now
	// span, _ := event.CreateSpan(context.Background())
	// defer span.Finish()

	n.clientEventsMutex.Lock()
	for _, sub := range n.clientEventsSubscribers {
		if sub.filter(event) {
			sub.queue <- event
		}
	}
	n.clientEventsMutex.Unlock()
}

func (n *Node) handleOutgoingEvent(ctx context.Context, event *p2p.Event) {
	logger().Debug("outgoing event", zap.Stringer("event", event))

	span, ctx := event.CreateSpan(ctx)

	envelope := p2p.Envelope{}
	eventBytes, err := proto.Marshal(event)
	if err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "failed to marshal outgoing event"))
		span.Finish()
		return
	}

	event.SenderID = n.b64pubkey

	switch {
	case event.ReceiverID != "": // ContactEvent
		envelope.Source = n.aliasEnvelopeForContact(ctx, &envelope, event)
		envelope.ChannelID = event.ReceiverID
		envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver

	case event.ConversationID != "": //ConversationEvent
		envelope.Source = n.aliasEnvelopeForConversation(ctx, &envelope, event)
		envelope.ChannelID = event.ConversationID
		envelope.EncryptedEvent = eventBytes // FIXME: encrypt for conversation

	default:
		n.LogBackgroundError(ctx, fmt.Errorf("unhandled event type"))
	}

	if envelope.Signature, err = keypair.Sign(n.crypto, &envelope); err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "failed to sign envelope"))
		span.Finish()
		return
	}

	// Async subscribe to conversation
	// wait for 1s to simulate a sync subscription,
	// if too long, the task will be done in background
	done := make(chan bool, 1)
	go func() {
		// FIXME: make something smarter, i.e., grouping events by contact or network driver
		if err := n.networkDriver.Emit(ctx, &envelope); err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "failed to emit envelope on network"))
		}
		done <- true
		span.Finish()
	}()
	select {
	case <-done:
	case <-time.After(1 * time.Second):
	}
	// push the outgoing event on the client stream
	n.clientEvents <- event
}

// Start is the node's mainloop
func (n *Node) Start(ctx context.Context, withCron, withNodeEvents bool) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if withCron {
		go n.cron(ctx)
	}

	if withNodeEvents {
		// "node started" event
		go func() {
			time.Sleep(time.Second)
			n.EnqueueNodeEvent(ctx, node.Kind_NodeStarted, nil)
		}()

		// "node is alive" event
		go func() {
			for {
				n.EnqueueNodeEvent(ctx, node.Kind_NodeIsAlive, nil)
				time.Sleep(30 * time.Second)
			}
		}()

		// statistics events
		go func() {
			for {
				time.Sleep(10 * time.Second)
				stats := node.StatisticsAttrs{}
				// FIXME: support multierr

				// peers count
				peers, err := n.Peers(ctx, nil)
				if err != nil {
					stats.ErrMsg = err.Error()
				} else {
					stats.PeersCount = int32(len(peers.List))
				}

				n.EnqueueNodeEvent(ctx, node.Kind_Statistics, &stats)
			}
		}()
	}

	if n.notificationDriver != nil {
		n.notificationDriver.Register()
	}

	for {
		select {
		case event := <-n.outgoingEvents:
			n.handleOutgoingEvent(ctx, event)
			// emit the outgoing event on the node event stream
		case event := <-n.clientEvents:
			n.handleClientEvent(ctx, event)
		}
	}
}
