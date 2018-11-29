package node

import (
	"context"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (n *Node) EnqueueClientEvent(ctx context.Context, event *p2p.Event) error {
	span, _ := tracing.EnterFunc(ctx, event)
	defer span.Finish()

	if err := event.Validate(); err != nil {
		return errors.Wrap(err, "invalid event")
	}
	sql := n.sql(ctx)
	if err := sql.Create(event).Error; err != nil {
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
	span, _ := tracing.EnterFunc(stream.Context(), input)
	defer span.Finish()

	logger().Debug("EventStream connected", zap.Stringer("input", input))

	sub := clientEventSubscriber{
		filter: func(e *p2p.Event) bool {
			if input.Filter == nil {
				return true
			}
			if input.Filter.Direction != p2p.Event_UnknownDirection && e.Direction != input.Filter.Direction {
				return false
			}
			if input.Filter.Kind != p2p.Kind_Unknown && e.Kind != input.Filter.Kind {
				return false
			}
			if input.Filter.ConversationID != "" && e.ConversationID != input.Filter.ConversationID {
				return false
			}
			return true
		},
		queue: make(chan *p2p.Event, 100),
	}

	n.clientEventsMutex.Lock()
	n.clientEventsSubscribers = append(n.clientEventsSubscribers, sub)
	n.clientEventsMutex.Unlock()

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
