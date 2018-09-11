package node

import (
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"github.com/pkg/errors"
	"go.uber.org/zap"
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

type clientEventSubscriber struct {
	filter func(*p2p.Event) bool
	queue  chan *p2p.Event
}

// EventStream implements berty.node.EventStream
func (n *Node) EventStream(input *node.EventStreamInput, stream node.Service_EventStreamServer) error {
	logger().Debug("EventStream connected", zap.Stringer("input", input))

	sub := clientEventSubscriber{
		filter: func(e *p2p.Event) bool {
			if input.Filter == nil {
				return true
			}
			if input.Filter.Kind != p2p.Kind_Unknown && e.Kind != input.Filter.Kind {
				return false
			}
			if input.Filter.ConversationID != "" && e.ConversationID != input.Filter.ConversationID {
				return false
			}
			return true
		},
		queue: make(chan *p2p.Event, 1),
	}

	// write lock
	n.clientEventsSubscribers = append(n.clientEventsSubscribers, sub)

	defer func() {
		logger().Debug("EventStream disconnected", zap.Stringer("input", input))

		// write lock
		// FIXME: remove sub
	}()

	for {
		select {
		case <-stream.Context().Done():
			return stream.Context().Err()
		case event := <-sub.queue:
			if err := stream.Send(event); err != nil {
				return err
			}
		}
	}
}
