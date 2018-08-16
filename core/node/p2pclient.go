package node

import (
	"github.com/pkg/errors"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

func (n *Node) NewContactEvent(destination *entity.Contact, kind p2p.Kind) *p2p.Event {
	event := p2p.NewOutgoingEvent(n.config.Myself.ID, destination.ID, kind)
	event.ID = n.NewID()
	return event
}

func (n *Node) NewConversationEvent(destination *entity.Conversation, kind p2p.Kind) *p2p.Event {
	event := p2p.NewOutgoingEvent(n.config.Myself.ID, "", kind)
	event.ConversationID = destination.ID
	event.ID = n.NewID()
	return event
}

func (n *Node) EnqueueOutgoingEvent(event *p2p.Event) error {
	if err := event.Validate(); err != nil {
		return errors.Wrap(err, "invalid event")
	}
	if err := n.sql.Create(event).Error; err != nil {
		return errors.Wrap(err, "failed to write event to db")
	}
	n.outgoingEvents <- event
	return nil
}

func (n *Node) contactShareMe(to *entity.Contact) error {
	event := n.NewContactEvent(to, p2p.Kind_ContactShareMe)
	if err := event.SetAttrs(&p2p.ContactShareAttrs{Contact: n.config.Myself.Filtered()}); err != nil {
		return err
	}
	if err := n.EnqueueOutgoingEvent(event); err != nil {
		return err
	}
	return nil
}
