package node

import (
	"container/heap"
	"context"
	"time"

	"berty.tech/core/entity"
)

const (
	outEvent = iota
	clientEvent
)

type EventItem struct {
	event     interface{}
	addAt     time.Time
	eventType int
}

type PriorityQueue []*EventItem

func (pq PriorityQueue) Len() int {
	return len(pq)
}

func (pq PriorityQueue) Less(i, j int) bool {
	if pq[i].eventType == pq[j].eventType {
		return pq[i].addAt.After(pq[j].addAt)
	} else if pq[i].eventType == clientEvent {
		return true
	}
	return false
}

func (pq PriorityQueue) Swap(i, j int) { pq[i], pq[j] = pq[j], pq[i] }

func (pq *PriorityQueue) Push(x interface{}) { *pq = append(*pq, x.(*EventItem)) }

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

func queue(in <-chan *EventItem, out chan<- *EventItem) {
	var currentItem *EventItem
	var currentIn = in
	var currentOut chan<- *EventItem
	pq := make(PriorityQueue, 0)
	heap.Init(&pq)

	defer close(out)

	for {
		select {
		case item, ok := <-currentIn:
			if !ok {
				currentIn = nil
				if currentItem == nil {
					return
				}
				continue
			}

			if currentItem != nil {
				heap.Push(&pq, currentItem)
			}

			heap.Push(&pq, item)
			currentOut = out
			currentItem = heap.Pop(&pq).(*EventItem)

		case currentOut <- currentItem:
			if len(pq) > 0 {
				currentItem = heap.Pop(&pq).(*EventItem)
			} else {
				if currentIn == nil {
					return
				}

				currentItem = nil
				currentOut = nil
			}
		}
	}
}

func (n *Node) publishEvent(in chan<- *EventItem) {
	for {
		select {
		case eventDispatch := <-n.outgoingEvents:
			in <- &EventItem{
				event:     eventDispatch,
				addAt:     time.Now(),
				eventType: outEvent,
			}
		case event := <-n.clientEvents:
			in <- &EventItem{
				event:     event,
				addAt:     time.Now(),
				eventType: clientEvent,
			}
		case <-n.shutdown:
			logger().Debug("node shutdown events handlers")
			return
		}
	}
}

func (n *Node) consumeEvent(ctx context.Context, out <-chan *EventItem) {
	for {
		eventItem := <-out
		if eventItem.eventType == clientEvent {
			n.handleClientEvent(ctx, eventItem.event.(*entity.Event))
		} else {
			n.handleOutgoingEventDispatch(ctx, eventItem.event.(*entity.EventDispatch))
		}
	}
}

func (n *Node) UseEventHandler(ctx context.Context) {
	in := make(chan *EventItem, 100)
	out := make(chan *EventItem)

	go queue(in, out)
	go n.publishEvent(in)
	go n.consumeEvent(ctx, out)
}
