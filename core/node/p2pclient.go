package node

import (
	"github.com/pkg/errors"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
)

func (n *Node) NewContactEvent(destination *entity.Contact, kind p2p.Kind) *p2p.Event {
	event := p2p.NewOutgoingEvent(n.config.Myself.ID, destination.ID, kind)
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
