package node

import (
	"context"
	"time"

	"github.com/pkg/errors"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
)

// EventsRetry updates SentAt and requeue an event
func (n *Node) EventRequeue(event *p2p.Event) error {
	now := time.Now()
	event.SentAt = &now
	if err := n.sql.Save(event).Error; err != nil {
		return errors.Wrap(err, "error while updating SentAt on event")
	}
	n.outgoingEvents <- event

	return nil
}

// EventsRetry sends events which lack an AckedAt value emitted before the supplied time value
func (n *Node) EventsRetry(before time.Time) ([]*p2p.Event, error) {
	var retriedEvents []*p2p.Event
	destinations, err := p2p.FindNonAcknowledgedEventDestinations(n.sql, before)

	if err != nil {
		return nil, err
	}

	for _, destination := range destinations {
		events, err := p2p.FindNonAcknowledgedEventsForDestination(n.sql, destination)

		if err != nil {
			logger().Error("error while retrieving events for dst", zap.Error(err))
			continue
		}

		for _, event := range events {
			err := n.EventRequeue(event)

			if err != nil {
				logger().Error("error while enqueuing event", zap.Error(err))
				continue
			}
			retriedEvents = append(retriedEvents, event)
		}
	}

	return retriedEvents, nil
}

// Start is the node's mainloop
func (n *Node) Start(withCron bool) error {
	ctx := context.Background()

	if withCron {
		go func() {
			for true {
				before := time.Now().Add(-time.Second * 60 * 10)
				_, err := n.EventsRetry(before)

				if err != nil {
					logger().Error("error while retrieving non acked destinations", zap.Error(err))
				}

				time.Sleep(time.Second * 60)
			}
		}()
	}

	for {
		select {
		case event := <-n.outgoingEvents:
			logger().Debug("outgoing event", zap.Stringer("event", event))
			envelope := p2p.Envelope{}
			eventBytes, err := proto.Marshal(event)
			if err != nil {
				logger().Warn("failed to marshal outgoing event", zap.Error(err))
			}

			event.SenderID = n.b64pubkey

			switch {
			case event.ReceiverID != "": // ContactEvent
				envelope.Source = n.aliasEnvelopeForContact(&envelope, event)
				envelope.ChannelID = event.ReceiverID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver

			case event.ConversationID != "": //ConversationEvent
				envelope.Source = n.aliasEnvelopeForConversation(&envelope, event)
				envelope.ChannelID = event.ConversationID
				envelope.EncryptedEvent = eventBytes // FIXME: encrypt for conversation

			default:
				logger().Error("unhandled event type")
			}

			if envelope.Signature, err = keypair.Sign(n.crypto, &envelope); err != nil {
				logger().Error("failed to sign envelope", zap.Error(err))
				continue
			}

			// Async subscribe to conversation
			// wait for 1s to simulate a sync subscription,
			// if too long, the task will be done in background
			done := make(chan bool, 1)
			go func() {
				// FIXME: make something smarter, i.e., grouping events by contact or network driver
				if err := n.networkDriver.Emit(ctx, &envelope); err != nil {
					logger().Error("failed to emit envelope on network", zap.Error(err))
				}
				done <- true
			}()
			select {
			case <-done:
			case <-time.After(1 * time.Second):
			}

			// push the outgoing event on the client stream
			n.clientEvents <- event

			// emit the outgoing event on the node event stream
		case event := <-n.clientEvents:
			logger().Debug("client event", zap.Stringer("event", event))
			n.clientEventsMutex.Lock()
			for _, sub := range n.clientEventsSubscribers {
				if sub.filter(event) {
					sub.queue <- event
				}
			}
			n.clientEventsMutex.Unlock()
		}
	}
}
