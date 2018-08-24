package node

import (
	"berty.tech/core/api/p2p"
	"github.com/pkg/errors"
)

func (n *Node) EnqueueClientEvent(event *p2p.Event) error {
	if err := event.Validate(); err != nil {
		return errors.Wrap(err, "invalid event")
	}
	if err := n.sql.Create(event).Error; err != nil {
		return errors.Wrap(err, "failed to write event to db")
	}
	n.clientEvents <- event
	return nil
}
