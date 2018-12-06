package node

import (
	"context"

	"berty.tech/core/pkg/errorcodes"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	opentracing "github.com/opentracing/opentracing-go"
)

func (n *Node) NewContactEvent(ctx context.Context, destination *entity.Contact, kind p2p.Kind) *p2p.Event {
	span, ctx := tracing.EnterFunc(ctx, destination, kind)
	defer span.Finish()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination.ID, kind)
	event.ID = n.NewID()
	return event
}

func (n *Node) NewConversationEvent(ctx context.Context, destination *entity.Conversation, kind p2p.Kind) *p2p.Event {
	span, ctx := tracing.EnterFunc(ctx, destination, kind)
	defer span.Finish()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, "", kind)
	event.ConversationID = destination.ID
	event.ID = n.NewID()

	return event
}

func (n *Node) EnqueueOutgoingEvent(ctx context.Context, event *p2p.Event) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, event)
	defer span.Finish()

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
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, to)
	defer span.Finish()

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
	span, ctx := tracing.EnterFunc(ctx, destination, aliases)
	defer span.Finish()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, p2p.Kind_SenderAliasUpdate)
	event.ID = n.NewID()
	if err := event.SetAttrs(&p2p.SenderAliasUpdateAttrs{Aliases: aliases}); err != nil {
		return nil, err
	}

	return event, nil
}

func (n *Node) NewSeenEvent(ctx context.Context, destination string, ids []string) (*p2p.Event, error) {
	span, ctx := tracing.EnterFunc(ctx, destination, ids)
	defer span.Finish()

	event := p2p.NewOutgoingEvent(ctx, n.b64pubkey, destination, p2p.Kind_Seen)
	event.ID = n.NewID()
	event.Kind = p2p.Kind_Seen
	if err := event.SetAttrs(&p2p.SeenAttrs{IDs: ids}); err != nil {
		return event, nil
	}
	return event, nil
}
