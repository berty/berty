package node

import (
	"context"
	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
)

func (n *Node) NewContactEvent(ctx context.Context, destination *entity.Contact, kind p2p.Kind) *p2p.Event {
	tracer := tracing.EnterFunc(ctx, destination, kind)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination.ID, kind)
	event.ID = n.NewID()
	return event
}

func (n *Node) NewConversationEvent(ctx context.Context, destination *entity.Conversation, kind p2p.Kind) *p2p.Event {
	tracer := tracing.EnterFunc(ctx, destination, kind)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, "", kind)
	event.ConversationID = destination.ID
	event.ID = n.NewID()

	return event
}

func (n *Node) EnqueueOutgoingEvent(ctx context.Context, event *p2p.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	if err := event.Validate(); err != nil {
		return errorcodes.ErrEventData.Wrap(err)
	}
	sql := n.sql(ctx)
	if err := sql.Create(event).Error; err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}
	n.outgoingEvents <- event

	return nil
}

func (n *Node) contactShareMe(ctx context.Context, to *entity.Contact) error {
	tracer := tracing.EnterFunc(ctx, to)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := n.NewContactEvent(ctx, to, p2p.Kind_ContactShareMe)
	if err := event.SetAttrs(&p2p.ContactShareMeAttrs{Me: n.config.Myself.Filtered()}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
		return err
	}

	return nil
}

func (n *Node) NewSenderAliasEvent(ctx context.Context, destination string, aliases []*entity.SenderAlias) (*p2p.Event, error) {
	tracer := tracing.EnterFunc(ctx, destination, aliases)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, p2p.Kind_SenderAliasUpdate)
	event.ID = n.NewID()
	if err := event.SetAttrs(&p2p.SenderAliasUpdateAttrs{Aliases: aliases}); err != nil {
		return nil, err
	}

	return event, nil
}

func (n *Node) NewSeenEvent(ctx context.Context, destination string, ids []string) (*p2p.Event, error) {
	tracer := tracing.EnterFunc(ctx, destination, ids)
	defer tracer.Finish()
	ctx = tracer.Context()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, p2p.Kind_Seen)
	event.ID = n.NewID()
	event.Kind = p2p.Kind_Seen
	if err := event.SetAttrs(&p2p.SeenAttrs{IDs: ids}); err != nil {
		return event, nil
	}
	return event, nil
}

func (n *Node) BroadcastEventToContacts(ctx context.Context, event *p2p.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

	var contacts []*entity.Contact

	sql := n.sql(ctx)
	query := sql.Model(entity.Contact{}).Where("status IN (?)", []entity.Contact_Status{
		entity.Contact_IsFriend,
		entity.Contact_IsTrustedFriend,
	})

	if err := query.Find(&contacts).Error; err != nil {
		return errorcodes.ErrDb.Wrap(err)
	}

	for _, contact := range contacts {
		contactEvent := event.Copy()
		contactEvent.ReceiverID = contact.ID

		if err := n.EnqueueOutgoingEvent(ctx, contactEvent); err != nil {
			logger().Error("node.BroadcastEventToContacts", zap.Error(err))
			return errorcodes.ErrEvent.New()
		}
	}

	return nil
}
