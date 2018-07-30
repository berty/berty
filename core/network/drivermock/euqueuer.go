package drivermock

import (
	"context"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/network"
)

type Enqueuer struct {
	network.Driver

	queue chan *p2p.Event
}

func NewEnqueuer() *Enqueuer {
	return &Enqueuer{
		queue: make(chan *p2p.Event, 100),
	}
}

func (e *Enqueuer) Queue() chan *p2p.Event {
	return e.queue
}

func (e *Enqueuer) SendEvent(_ context.Context, event *p2p.Event) error {
	e.queue <- event
	return nil
}
