package node

import (
	"context"
	"time"

	"github.com/pkg/errors"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"go.uber.org/zap"
)

type OutgoingEventOptions struct {
	DisableEventLogging bool
}

func (n *Node) NewEvent(ctx context.Context) *entity.Event {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &entity.Event{
		ID:              n.NewID(),
		APIVersion:      p2p.Version,
		CreatedAt:       time.Now().UTC(),
		Direction:       entity.Event_Outgoing,
		Dispatches:      make([]*entity.EventDispatch, 0),
		SourceContactID: n.config.MyselfID,
		SourceDeviceID:  n.b64pubkey,
		AckStatus:       entity.Event_NotAcked,
	}
}

func (n *Node) EnqueueOutgoingEvent(ctx context.Context, event *entity.Event) error {
	return n.EnqueueOutgoingEventWithOptions(ctx, event, &OutgoingEventOptions{})
}

func (n *Node) EnqueueOutgoingEventWithOptions(ctx context.Context, event *entity.Event, options *OutgoingEventOptions) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	if err := event.Err(); err != nil {
		return errorcodes.ErrEventData.Wrap(err)
	}

	if err := event.Validate(); err != nil {
		return errorcodes.ErrEventData.Wrap(err)
	}

	if options.DisableEventLogging == false {
		sql := n.sql(ctx)
		if err := sql.Create(event).Error; err != nil {
			return errorcodes.ErrDbCreate.Wrap(err)
		}
	}

	dispatches, err := n.activeDispatchesFromEvent(ctx, event)
	if err != nil {
		return errors.Wrap(err, "failed to prepare envelope from event")
	}

	if len(dispatches) < 1 {
		return errors.New("no active dispatches for a freshly added outgoing event")
	}

	go func() {
		for _, dispatch := range dispatches {
			n.outgoingEvents <- dispatch
		}
	}()

	tracer.SetMetadata("new-outgoing-event", event.ID)

	return nil
}

func (n *Node) contactShareMe(ctx context.Context, to *entity.Contact) error {
	tracer := tracing.EnterFunc(ctx, to)
	defer tracer.Finish()
	ctx = tracer.Context()

	return n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetToContact(to).
			SetContactShareMeAttrs(&entity.ContactShareMeAttrs{
				Me: n.config.Myself.Filtered().WithPushInformation(n.sql(ctx)),
			}))
}

func (n *Node) BroadcastEventToContacts(ctx context.Context, event *entity.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	contacts, err := n.allTrustedContacts(ctx)

	if err != nil {
		return errorcodes.ErrDb.Wrap(err)
	}
	for _, contact := range contacts {
		contactEvent := event.Copy()
		contactEvent.TargetAddr = contact.ID

		if err := n.EnqueueOutgoingEvent(ctx, contactEvent); err != nil {
			logger().Error("node.BroadcastEventToContacts", zap.Error(err))
			return errorcodes.ErrEvent.New()
		}
	}

	return nil
}
