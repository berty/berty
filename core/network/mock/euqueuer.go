package mock

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

type Enqueuer struct {
	network.Driver

	contactID string
	queue     chan *entity.Envelope
	pingQueue chan string
}

func NewEnqueuer(ctx context.Context) *Enqueuer {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &Enqueuer{
		queue:     make(chan *entity.Envelope, 100),
		pingQueue: make(chan string, 100),
	}
}

func (e *Enqueuer) Queue() chan *entity.Envelope {
	return e.queue
}

func (e *Enqueuer) Emit(ctx context.Context, envelope *entity.Envelope) error {
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

func (e *Enqueuer) OnEnvelopeHandler(_ func(context.Context, *entity.Envelope) (*entity.Void, error)) {
	// doing nothing, enqueuer does not support receiving events
}

func (e *Enqueuer) PingOtherNode(ctx context.Context, destination string) error {
	tracer := tracing.EnterFunc(ctx, destination)
	defer tracer.Finish()
	// ctx = tracer.Context()

	e.pingQueue <- destination
	return nil
}

func (e *Enqueuer) SetContactID(contactID string) {
	e.contactID = contactID
}

func (e *Enqueuer) Join(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx, e.contactID)
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
