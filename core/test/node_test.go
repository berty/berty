package test

import (
	"context"
	"io"
	"testing"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/network/mock"
	. "github.com/smartystreets/goconvey/convey"
)

type eventStreamEntry struct {
	event *entity.Event
	err   error
}

func streamToQueue(queue chan eventStreamEntry, stream node.Service_EventStreamClient, c C) {
	for {
		ctx := stream.Context()
		data, err := stream.Recv()
		select {
		case <-ctx.Done():
			return
		default:
			if err == io.EOF {
				logger().Debug("stream EOF")
				return
			}
			if err != nil {
				c.So(err, ShouldBeNil)
			}
			queue <- eventStreamEntry{data, err}
		}
	}
}

func TestNodeHelpers(t *testing.T) {
	Convey("Testing Node", t, func() {
		Convey("Testing Node.EventStream", FailureContinues, func(c C) {
			t.Skip("see https://github.com/berty/berty/issues/252")
			app, err := NewAppMock(context.Background(), &entity.Device{Name: "test phone"}, mock.NewEnqueuer(context.Background()))
			So(err, ShouldBeNil)
			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)
			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)

			// streamA accepts everything
			queueA := make(chan eventStreamEntry, 100)
			streamA, err := app.client.Node().EventStream(app.ctx, &node.EventStreamInput{})
			So(err, ShouldBeNil)
			go streamToQueue(queueA, streamA, c)

			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 0)

			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)
			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)

			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 2)

			// streamB accepts everything
			queueB := make(chan eventStreamEntry, 100)
			streamB, err := app.client.Node().EventStream(app.ctx, &node.EventStreamInput{})
			So(err, ShouldBeNil)
			go streamToQueue(queueB, streamB, c)

			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)
			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{}), ShouldBeNil)

			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 4)
			So(len(queueB), ShouldEqual, 2)

			// streamC filters on kind=ping
			queueC := make(chan eventStreamEntry, 100)
			streamC, err := app.client.Node().EventStream(app.ctx, &node.EventStreamInput{
				Filter: &entity.Event{
					Kind: entity.Kind_Ping,
				},
			})
			So(err, ShouldBeNil)
			go streamToQueue(queueC, streamC, c)

			// streamD filters on conversationn_id="abcde"
			queueD := make(chan eventStreamEntry, 100)
			streamD, err := app.client.Node().EventStream(app.ctx, &node.EventStreamInput{
				Filter: &entity.Event{
					TargetType: entity.Event_ToSpecificConversation,
					TargetAddr: "abcde",
				},
			})
			So(err, ShouldBeNil)
			go streamToQueue(queueD, streamD, c)

			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{
				Kind:       entity.Kind_Ack,
				TargetType: entity.Event_ToSpecificConversation,
				TargetAddr: "bbbb",
			}), ShouldBeNil)
			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 5)
			So(len(queueB), ShouldEqual, 3)
			So(len(queueC), ShouldEqual, 0)
			So(len(queueD), ShouldEqual, 0)

			So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{
				Kind:       entity.Kind_Ping,
				TargetType: entity.Event_ToSpecificConversation,
				TargetAddr: "abcde",
			}), ShouldBeNil)
			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 6)
			So(len(queueB), ShouldEqual, 4)
			So(len(queueC), ShouldEqual, 1)
			So(len(queueD), ShouldEqual, 1)

			additionalQueues := make([]chan eventStreamEntry, 0)
			for i := 0; i < 50; i++ {
				queue := make(chan eventStreamEntry, 100)
				stream, err := app.client.Node().EventStream(app.ctx, &node.EventStreamInput{})
				So(err, ShouldBeNil)
				go streamToQueue(queue, stream, c)
				additionalQueues = append(additionalQueues, queue)
			}

			for i := 0; i < 50; i++ {
				So(app.node.EnqueueClientEvent(app.ctx, &entity.Event{
					Kind:       entity.Kind_Ping,
					TargetType: entity.Event_ToSpecificConversation,
					TargetAddr: "bbbb",
				}), ShouldBeNil)
			}
			time.Sleep(50 * time.Millisecond)
			So(len(queueA), ShouldEqual, 56)
			So(len(queueB), ShouldEqual, 54)
			So(len(queueC), ShouldEqual, 51)
			So(len(queueD), ShouldEqual, 1)
			for _, queue := range additionalQueues {
				So(len(queue), ShouldEqual, 50)
			}

			app.Close()
			// FIXME: send more messages than chan capacity
			// FIXME: remove subs (unsubscribe)
		})
	})
}
