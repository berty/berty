package node

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/sql"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// EventsRetry updates SentAt and requeue an event
func (n *Node) EventRequeue(ctx context.Context, event *entity.Event) error {
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
func (n *Node) EventsRetry(ctx context.Context, before time.Time) ([]*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, before)
	defer tracer.Finish()
	ctx = tracer.Context()

	sql := n.sql(ctx)
	var retriedEvents []*entity.Event
	destinations, err := entity.FindNonAcknowledgedEventDestinations(sql, before)

	if err != nil {
		return nil, err
	}

	for _, destination := range destinations {
		events, err := entity.FindNonAcknowledgedEventsForDestination(sql, destination)

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

func (n *Node) handleClientEvent(ctx context.Context, event *entity.Event) {
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

func (n *Node) handleOutgoingEvent(ctx context.Context, event *entity.Event) {
	logger().Debug("outgoing event", zap.Stringer("event", event))

	span, ctx := event.CreateSpan(ctx)

	envelope := entity.Envelope{}
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

	contactsForEvent, err := n.getContactsForEvent(ctx, event)
	if err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "failed get contacts for event"))
		span.Finish()
		return
	}

	wg := sync.WaitGroup{}
	wg.Add(len(contactsForEvent))

	for _, contact := range contactsForEvent {
		// Ignore myself
		if contact.ID == n.UserID() {
			wg.Done()
			continue
		}
		go func(contact *entity.Contact) {
			// Async subscribe to conversation
			// wait for 1s to simulate a sync subscription,
			// if too long, the task will be done in background
			done := make(chan bool, 1)
			go func() {
				tctx, cancel := context.WithTimeout(ctx, time.Second*10)
				defer cancel()

				envCopy := envelope
				envCopy.ChannelID = contact.ID

				if envCopy.Signature, err = keypair.Sign(n.crypto, &envCopy); err != nil {
					n.LogBackgroundError(ctx, errors.Wrap(err, "failed to sign envelope"))
					span.Finish()
					return
				}
				// FIXME: make something smarter, i.e., grouping events by contact or network driver
				if err := n.networkDriver.Emit(tctx, &envCopy); err != nil {
					n.LogBackgroundWarn(ctx, errors.Wrap(err, "failed to emit envelope on network"))

					// push the outgoing event on the client stream
					go n.queuePushEvent(ctx, event, &envelope)

					span.Finish()
					return
				}

				done <- true
				span.Finish()
			}()
			select {
			case <-done:
			case <-time.After(1 * time.Second):
				// push the outgoing event on the client stream
				go n.queuePushEvent(ctx, event, &envelope)
			}

			wg.Done()
		}(contact)
	}

	wg.Wait()

	n.clientEvents <- event
}

func (n *Node) getContactsForEvent(ctx context.Context, event *entity.Event) ([]*entity.Contact, error) {
	db := n.sql(ctx)
	var subqueryContactIDs interface{}
	contacts := []*entity.Contact{}

	if event.ConversationID != "" {
		subqueryContactIDs = db.
			Model(&entity.ConversationMember{}).
			Select("contact_id").
			Where(&entity.ConversationMember{ConversationID: event.ConversationID}).
			QueryExpr()
	} else if event.ReceiverID != "" {
		subqueryContactIDs = []string{event.ReceiverID}
	}

	if err := db.
		Model(&entity.Contact{}).
		Where("id IN (?)", subqueryContactIDs).
		Find(&contacts).
		Error; err != nil {
		return nil, sql.GenericError(err)
	}

	return contacts, nil
}

func (n *Node) UseNodeEvent(ctx context.Context) {
	// "node started" event
	go func() {
		time.Sleep(time.Second)
		n.EnqueueNodeEvent(ctx, node.Kind_NodeStarted, nil)
	}()

	// "node is alive" event
	go func() {
		for {
			n.EnqueueNodeEvent(ctx, node.Kind_NodeIsAlive, nil)
			select {
			case <-time.After(30 * time.Second):
				continue
			case <-n.shutdown:
				logger().Debug("node shutdown alive emitter")
				return
			}
		}
	}()

	// statistics events
	go func() {
		for {
			select {
			case <-time.After(10 * time.Second):
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
			case <-n.shutdown:
				logger().Debug("node shutdown statistics event emitter")
				return
			}
		}
	}()
}

func (n *Node) UseEventHandler(ctx context.Context) {
	go func() {
		for {
			select {
			case event := <-n.outgoingEvents:
				n.handleOutgoingEvent(ctx, event)
				// emit the outgoing event on the node event stream
			case event := <-n.clientEvents:
				n.handleClientEvent(ctx, event)
			case <-n.shutdown:
				logger().Debug("node shutdown events handlers")
				return
			}
		}
	}()
}

// Start is the node's mainloop
func (n *Node) Start(ctx context.Context, withCron, withNodeEvents bool) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if withCron {
		go n.cron(ctx)
	}

	if withNodeEvents {
		n.UseNodeEvent(ctx)
	}

	if n.notificationDriver != nil {
		n.UseNotificationDriver(ctx)
	}

	n.UseEventHandler(ctx)
}
