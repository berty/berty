package mock

import (
	"context"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

type Enqueuer struct {
	network.Driver

	queue     chan *p2p.Envelope
	pingQueue chan string
}

func NewEnqueuer(ctx context.Context) *Enqueuer {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	return &Enqueuer{
		queue:     make(chan *p2p.Envelope, 100),
		pingQueue: make(chan string, 100),
	}
}

func (e *Enqueuer) Queue() chan *p2p.Envelope {
	return e.queue
}

func (e *Enqueuer) Emit(ctx context.Context, envelope *p2p.Envelope) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	e.queue <- envelope
	return nil
}

func (e *Enqueuer) Start(ctx context.Context) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	select {} // wait forever
}

func (e *Enqueuer) OnEnvelopeHandler(_ func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	// doing nothing, enqueuer does not support receiving events
}

func (e *Enqueuer) PingOtherNode(ctx context.Context, destination string) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	e.pingQueue <- destination
	return nil
}

func (e *Enqueuer) Join(ctx context.Context, _ string) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	return nil
}

func (e *Enqueuer) Close(ctx context.Context) error {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	return nil
}
