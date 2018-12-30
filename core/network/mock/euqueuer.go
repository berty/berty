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
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &Enqueuer{
		queue:     make(chan *p2p.Envelope, 100),
		pingQueue: make(chan string, 100),
	}
}

func (e *Enqueuer) Queue() chan *p2p.Envelope {
	return e.queue
}

func (e *Enqueuer) Emit(ctx context.Context, envelope *p2p.Envelope) error {
	tracer := tracing.EnterFunc(ctx, envelope)
	defer tracer.Finish()
	// ctx = tracer.Context()

	e.queue <- envelope
	return nil
}

func (e *Enqueuer) Start(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	select {} // wait forever
}

func (e *Enqueuer) OnEnvelopeHandler(_ func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	// doing nothing, enqueuer does not support receiving events
}

func (e *Enqueuer) PingOtherNode(ctx context.Context, destination string) error {
	tracer := tracing.EnterFunc(ctx, destination)
	defer tracer.Finish()
	// ctx = tracer.Context()

	e.pingQueue <- destination
	return nil
}

func (e *Enqueuer) Join(ctx context.Context, input string) error {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return nil
}

func (e *Enqueuer) Close(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return nil
}
