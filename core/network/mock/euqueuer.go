package mock

import (
	"context"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
)

type Enqueuer struct {
	network.Driver

	queue     chan *p2p.Envelope
	pingQueue chan string
}

func NewEnqueuer() *Enqueuer {
	return &Enqueuer{
		queue:     make(chan *p2p.Envelope, 100),
		pingQueue: make(chan string, 100),
	}
}

func (e *Enqueuer) Queue() chan *p2p.Envelope {
	return e.queue
}

func (e *Enqueuer) Emit(_ context.Context, envelope *p2p.Envelope) error {
	e.queue <- envelope
	return nil
}

func (e *Enqueuer) OnEnvelopeHandler(_ func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	// doing nothing, enqueuer does not support receiving events
}

func (e *Enqueuer) PingOtherNode(ctx context.Context, destination string) error {
	e.pingQueue <- destination

	return nil
}

func (e *Enqueuer) Join(_ context.Context, _ string) error {
	return nil
}

func (e *Enqueuer) Close() error {
	return nil
}
