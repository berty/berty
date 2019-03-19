package node

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
)

type OutgoingEventOptions struct {
	DisableEventLogging bool
}

func (n *Node) NewContactEvent(ctx context.Context, destination *entity.Contact, kind entity.Kind) *entity.Event {
	tracer := tracing.EnterFunc(ctx, destination, kind)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination.ID, kind)
	event.ID = n.NewID()
	return event
}

func (n *Node) NewConversationEvent(ctx context.Context, destination *entity.Conversation, kind entity.Kind) *entity.Event {
	tracer := tracing.EnterFunc(ctx, destination, kind)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, "", kind)
	event.ConversationID = destination.ID
	event.ID = n.NewID()

	return event
}

func (n *Node) EnqueueOutgoingEvent(ctx context.Context, event *entity.Event, options *OutgoingEventOptions) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	if err := event.Validate(); err != nil {
		return errorcodes.ErrEventData.Wrap(err)
	}

	if options.DisableEventLogging == false {
		sql := n.sql(ctx)
		if err := sql.Create(event).Error; err != nil {
			return errorcodes.ErrDbCreate.Wrap(err)
		}
	}

	n.outgoingEvents <- event

	tracer.SetMetadata("new-outgoing-event", event.ID)

	return nil
}

func (n *Node) contactShareMe(ctx context.Context, to *entity.Contact) error {
	tracer := tracing.EnterFunc(ctx, to)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := n.NewContactEvent(ctx, to, entity.Kind_ContactShareMe)
	if err := event.SetAttrs(&entity.ContactShareMeAttrs{Me: n.config.Myself.Filtered().WithPushInformation(n.sql(ctx))}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
		return err
	}

	return nil
}

func (n *Node) NewSenderAliasEvent(ctx context.Context, destination string, aliases []*entity.SenderAlias) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, destination, aliases)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, entity.Kind_SenderAliasUpdate)
	event.ID = n.NewID()
	if err := event.SetAttrs(&entity.SenderAliasUpdateAttrs{Aliases: aliases}); err != nil {
		return nil, err
	}

	return event, nil
}

func (n *Node) NewSeenEvent(ctx context.Context, destination string, ids []string) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, destination, ids)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, entity.Kind_Seen)
	event.ID = n.NewID()
	event.Kind = entity.Kind_Seen
	if err := event.SetAttrs(&entity.SeenAttrs{IDs: ids}); err != nil {
		return event, nil
	}
	return event, nil
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
		contactEvent.DestinationDeviceID = contact.ID

		if err := n.EnqueueOutgoingEvent(ctx, contactEvent, &OutgoingEventOptions{}); err != nil {
			logger().Error("node.BroadcastEventToContacts", zap.Error(err))
			return errorcodes.ErrEvent.New()
		}
	}

	return nil
}
