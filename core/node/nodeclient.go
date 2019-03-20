package node

import (
	"context"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func (n *Node) EnqueueClientEvent(ctx context.Context, event *entity.Event) error {
	tracer := tracing.EnterFunc(ctx, event)
	defer tracer.Finish()
	ctx = tracer.Context()

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
	filter func(*entity.Event) bool
	queue  chan *entity.Event
}

// EventStream implements berty.node.EventStream
func (n *Node) EventStream(input *node.EventStreamInput, stream node.Service_EventStreamServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	// ctx := tracer.Context()

	logger().Debug("EventStream connected", zap.Stringer("input", input))
	sub := clientEventSubscriber{
		filter: func(e *entity.Event) bool {
			if input.Filter == nil {
				return true
			}
			if input.Filter.Direction != entity.Event_UnknownDirection && e.Direction != input.Filter.Direction {
				return false
			}
			if input.Filter.Kind != entity.Kind_Unknown && e.Kind != input.Filter.Kind {
				return false
			}
			if input.Filter.TargetAddr != "" && e.TargetAddr != input.Filter.TargetAddr {
				return false
			}
			return true
		},
		queue: make(chan *entity.Event, 100),
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

type clientCommitLogsSubscriber struct {
	queue chan *node.CommitLog
}

func (n *Node) CommitLogStream(input *node.Void, stream node.Service_CommitLogStreamServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	// ctx := tracer.Context()

	logger().Debug("CommitLogStream connected", zap.Stringer("input", input))

	n.clientCommitLogsMutex.Lock()
	sub := clientCommitLogsSubscriber{
		queue: make(chan *node.CommitLog, 100),
	}
	n.clientCommitLogsSubscribers = append(n.clientCommitLogsSubscribers, sub)
	n.clientCommitLogsMutex.Unlock()

	defer func() {
		logger().Debug("CommitLogStream disconnected", zap.Stringer("input", input))

		n.clientCommitLogsMutex.Lock()
		defer n.clientCommitLogsMutex.Unlock()
		for i, s := range n.clientCommitLogsSubscribers {
			if s == sub {
				n.clientCommitLogsSubscribers = append(
					n.clientCommitLogsSubscribers[:i],
					n.clientCommitLogsSubscribers[i+1:]...,
				)
			}
		}
	}()

	for {
		select {
		case <-stream.Context().Done():
			return stream.Context().Err()
		case commitLog, ok := <-sub.queue:
			if !ok {
				logger().Error("CommitLogStream chan closed")
				return errors.New("commitLogStream chan closed")
			}
			if err := stream.Send(commitLog); err != nil {
				return err
			}
		}
	}
}
