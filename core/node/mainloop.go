package node

import (
	"context"
	"math/rand"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"

	"berty.tech/core/api/node"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/sql"
)

var rgenerator *rand.Rand

func init() {
	rgenerator = rand.New(rand.NewSource(time.Now().UnixNano()))
}

// EventsRetry updates SentAt and requeue an event
func (n *Node) EventRequeue(ctx context.Context, event *entity.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	dispatches, err := n.activeDispatchesFromEvent(ctx, event)

	if err != nil {
		return errors.Wrap(err, "error while updating SentAt on event")
	}

	for _, dispatch := range dispatches {
		n.outgoingEvents <- dispatch
	}

	return nil
}

func (n *Node) EventDispatchRequeue(ctx context.Context, dispatch *entity.EventDispatch) error {
	// tracer := tracing.EnterFunc(ctx, dispatch)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	n.outgoingEvents <- dispatch

	return nil
}

func getRetriableEvents(dispatches []*entity.EventDispatch) []*entity.EventDispatch {
	ret := make([]*entity.EventDispatch, 0)
	now := time.Now()
	for _, dispatch := range dispatches {
		if dispatch.SentAt == nil {
			ret = append(ret, dispatch)
			continue
		}
		eventTime := dispatch.SentAt.Add(time.Duration(dispatch.RetryBackoff) * time.Millisecond)
		if eventTime.Before(now) {
			ret = append(ret, dispatch)
		}
	}

	return ret
}

// OldEventsRetry sends events which lack an AckedAt value emitted before the supplied time value
func (n *Node) OldEventsRetry(ctx context.Context, before time.Time) ([]*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, before)
	defer tracer.Finish()
	ctx = tracer.Context()

	db := n.sql(ctx)
	retriedEventsMap := map[string]*entity.Event{}
	var retriedEvents []*entity.Event
	deviceIDs, err := entity.FindDevicesWithNonAcknowledgedEvents(db, before)

	if err != nil {
		return nil, err
	}

	for _, deviceID := range deviceIDs {
		dispatches, err := entity.FindNonAcknowledgedDispatchesForDestination(db, deviceID)

		if err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "error while retrieving events for dst"))
			continue
		}

		// TODO: Bundle all dispatches (or at least few of them) in a single envelope

		for _, dispatch := range dispatches {
			if err := n.EventDispatchRequeue(ctx, dispatch); err != nil {
				n.LogBackgroundError(ctx, errors.Wrap(err, "error while enqueuing event"))
				continue
			}

			event, err := sql.EventByID(db, dispatch.EventID)
			if err != nil {
				n.LogBackgroundError(ctx, errors.Wrap(err, "error while getting event detail"))
				continue
			}

			retriedEventsMap[event.ID] = event

		}
	}

	for _, event := range retriedEventsMap {
		retriedEvents = append(retriedEvents, event)
	}

	return retriedEvents, nil
}

// EventsRetry sends events which lack an AckedAt value emitted sent -24h
func (n *Node) EventsRetry(ctx context.Context) (time.Duration, []*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()
	db := n.sql(ctx)

	retriedEventsMap := map[string]*entity.Event{}
	var retriedEvents []*entity.Event

	dispatches, err := entity.FindDispatchesWithNonAcknowledgedEvents(db, time.Now().Add(-time.Hour*24))
	if err != nil {
		return 20000, nil, err
	}

	dispatches = getRetriableEvents(dispatches)
	var ret int64
	for i, dispatch := range dispatches {
		if i == 0 {
			ret = dispatch.RetryBackoff
		}

		if err := n.EventDispatchRequeue(ctx, dispatch); err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "error while enqueuing event"))
			continue
		}
		event, err := sql.EventByID(db, dispatch.EventID)
		if err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "error while getting event detail"))
			continue
		}

		if dispatch.RetryBackoff < ret {
			ret = dispatch.RetryBackoff
		}

		retriedEventsMap[event.ID] = event
	}

	for _, event := range retriedEventsMap {
		retriedEvents = append(retriedEvents, event)
	}

	if ret == 0 {
		ret = 20000
	}

	return time.Duration(ret), retriedEvents, nil
}

func (n *Node) cron(ctx context.Context) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()
	db := n.sql(ctx)

	dispatches, _ := entity.FindDispatchesWithNonAcknowledgedEvents(db, time.Now().Add(-time.Hour*24))
	if len(dispatches) > 0 {
		// reset dispatch backoff for event that we try to send a day ago
		dispatches = getRetriableEvents(dispatches)
		for _, dispatch := range dispatches {
			dispatch.RetryBackoff = 1600
			if err := db.Save(dispatch).Error; err != nil {
				n.LogBackgroundError(ctx, errors.Wrap(sql.GenericError(err), "error while updating RetryBackoff on event dispatch"))
			}
		}
	}

	for {
		waitTime, _, err := n.EventsRetry(ctx)
		if err != nil {
			n.LogBackgroundError(ctx, err)
		}
		time.Sleep(waitTime * time.Millisecond)
	}
}

func (n *Node) handleClientEvent(ctx context.Context, event *entity.Event) {
	// logger().Debug("client event", zap.Stringer("event", event))

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

func (n *Node) generateDispatchesForEvent(ctx context.Context, event *entity.Event) error {
	// tracer := tracing.EnterFunc(ctx, event)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	db := n.sql(ctx)

	query := db.Model(&entity.Device{})

	switch event.TargetType {
	case entity.Event_ToSpecificConversation:
		contactIDs := db.
			Model(&entity.ConversationMember{}).
			Select("contact_id").
			Where(&entity.ConversationMember{ConversationID: event.ToConversationID()}).
			QueryExpr()
		query = query.Where("contact_id IN (?)", contactIDs)
	case entity.Event_ToSpecificContact:
		query = query.Where(&entity.Device{ContactID: event.ToContactID()})
	case entity.Event_ToSpecificDevice:
		query = query.Where(&entity.Device{ID: event.ToDeviceID()})
	default:
		return errors.New("activeDispatchesFromEvent: unhandled target type")
	}

	var devices []*entity.Device
	if err := query.Find(&devices).Error; err != nil {
		return sql.GenericError(err)
	}

	tx := db.Begin()
	if err := tx.Error; err != nil {
		return sql.GenericError(err)
	}
	for _, device := range devices {
		dispatch := &entity.EventDispatch{
			EventID:   event.ID,
			DeviceID:  device.ID,
			ContactID: device.ContactID,
		}
		if err := tx.Create(&dispatch).Error; err != nil {
			tx.Rollback()
			return sql.GenericError(err)
		}
	}
	if err := tx.Commit().Error; err != nil {
		return sql.GenericError(err)
	}

	return nil
}

func (n *Node) activeDispatchesFromEvent(ctx context.Context, event *entity.Event) ([]*entity.EventDispatch, error) {
	// tracer := tracing.EnterFunc(ctx, event)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	if event.AckStatus == entity.Event_AckedByAllDevices {
		return []*entity.EventDispatch{}, nil
	}

	db := n.sql(ctx)

	if event.Dispatches == nil || len(event.Dispatches) == 0 { // intial Dispatches creation
		if err := n.generateDispatchesForEvent(ctx, event); err != nil {
			return nil, err
		}
	}

	// refresh event.Dispatches in case there were changes since the time the event was loaded from DB
	event.Dispatches = []*entity.EventDispatch{}
	err := db.
		Where(&entity.EventDispatch{EventID: event.ID}).
		Find(&event.Dispatches).
		Error
	if err != nil {
		return nil, err
	}

	// reload dispatches from DBs (if the status changed since the last event load from DB)
	// and filter out to only keep active dispatches (unacked ones)
	activeDispatches := []*entity.EventDispatch{}

	for _, dispatch := range event.Dispatches {
		if dispatch.ContactID == n.UserID() {
			continue
		}
		if dispatch.AckedAt != nil && !dispatch.AckedAt.IsZero() {
			continue
		}
		activeDispatches = append(activeDispatches, dispatch)
	}

	return activeDispatches, nil
}

func (n *Node) envelopeFromEvent(ctx context.Context, event *entity.Event) (*entity.Envelope, error) {
	// tracer := tracing.EnterFunc(ctx, event)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	envelope := entity.Envelope{}

	// FIXME: we should probably filter-out the event before marshaling

	eventBytes, err := proto.Marshal(event)
	if err != nil {
		return nil, err
	}

	switch event.TargetType {
	case entity.Event_ToSpecificContact:
		envelope.Source = n.aliasEnvelopeForContact(ctx, &envelope, event)
		envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver
		envelope.ChannelID = event.ToContactID()
	case entity.Event_ToSpecificDevice:
		// FIXME: investigate if we need to handle differently a Contact and a Device
		envelope.Source = n.aliasEnvelopeForContact(ctx, &envelope, event)
		envelope.EncryptedEvent = eventBytes // FIXME: encrypt for receiver
		envelope.ChannelID = event.ToDeviceID()
	case entity.Event_ToSpecificConversation:
		envelope.Source = n.aliasEnvelopeForConversation(ctx, &envelope, event)
		envelope.EncryptedEvent = eventBytes // FIXME: encrypt for the conversation
		envelope.ChannelID = event.ToConversationID()
	case entity.Event_ToAllContacts, entity.Event_ToSelf:
		return nil, errors.New("handleOutgoingEvent: target type not implemented")
	default:
		return nil, errors.New("handleOutgoingEvent: invalid target type")
	}

	return &envelope, nil
}

func (n *Node) sendDispatch(ctx context.Context, dispatch *entity.EventDispatch, event *entity.Event, envelope *entity.Envelope) error {
	// tracer := tracing.EnterFunc(ctx, dispatch, envelope)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	if dispatch.ContactID == n.UserID() {
		return nil
	}
	// Async subscribe to conversation
	// wait for 1s to simulate a sync subscription,
	// if too long, the task will be done in background
	done := make(chan bool, 1)
	go func() {
		tctx, cancel := context.WithTimeout(ctx, time.Second*10)
		defer cancel()

		envCopy := *envelope

		// create a copy of the envelope for the contact and resign
		// FIXME: envelope should be signed once per channel, not once per contact
		envCopy.ChannelID = dispatch.ContactID
		var err error
		envCopy.Signature, err = keypair.Sign(n.crypto, &envCopy)
		if err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "failed to sign envelope"))
			return
		}

		// FIXME: make something smarter, i.e., grouping events by contact or network driver
		if err := n.networkDriver.Emit(tctx, &envCopy); err != nil {
			n.LogBackgroundWarn(ctx, errors.Wrap(err, "failed to emit envelope on network"))

			// push the outgoing event on the client stream
			go n.queuePushEvent(ctx, event, envelope)
			return
		}

		done <- true
	}()
	select {
	case <-done:
	case <-time.After(1 * time.Second):
		// push the outgoing event on the client stream
		go n.queuePushEvent(ctx, event, envelope)
	}
	return nil
}

func (n *Node) handleOutgoingEventDispatch(ctx context.Context, dispatch *entity.EventDispatch) {
	// tracer := tracing.EnterFunc(ctx, dispatch)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	db := n.sql(ctx)
	now := time.Now()
	dispatch.SentAt = &now
	if dispatch.RetryBackoff == 0 {
		dispatch.RetryBackoff = 1600
	} else {
		dispatch.RetryBackoff *= 16
		dispatch.RetryBackoff /= 10
		dispatch.RetryBackoff *= 10 + 2*((int64(rgenerator.Float64()*100)*2.0-1.0)/100)
		dispatch.RetryBackoff /= 10
	}

	if err := db.Save(dispatch).Error; err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(sql.GenericError(err), "error while updating SentAt on event dispatch"))
		return
	}

	event, err := sql.EventByID(n.sql(ctx), dispatch.EventID)
	if err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "unable to retrieve event detail"))
		return
	}

	// generate an envelope
	envelope, err := n.envelopeFromEvent(ctx, event)
	if err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "failed to prepare envelope from event"))
		return
	}

	if err := n.sendDispatch(ctx, dispatch, event, envelope); err != nil {
		n.LogBackgroundError(ctx, errors.Wrap(err, "failed to send envelope to dispatch"))
	}

	// FIXME: save dispatch status in database

	n.clientEvents <- event
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
			case eventDispatch := <-n.outgoingEvents:
				n.handleOutgoingEventDispatch(ctx, eventDispatch)
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
