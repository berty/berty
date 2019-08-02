package network

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"berty.tech/network"
	p2pnet "berty.tech/network"
	"berty.tech/network/protocol/berty"
)

var _ p2pnet.Driver = (*Enqueuer)(nil)

type Enqueuer struct {
	network.Driver

	localContactID string
	queue          chan *entity.Envelope
	pingQueue      chan string
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

func (e *Enqueuer) EmitMessage(ctx context.Context, msg *berty.Message) error {
	tracer := tracing.EnterFunc(ctx, msg)
	defer tracer.Finish()
	// ctx = tracer.Context()

	env, err := GetEnvelopeFromMessage(msg)
	if err != nil {
		return err
	}

	e.queue <- env
	return nil
}

func (e *Enqueuer) Start(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	select {} // wait forever
}

func (e *Enqueuer) OnMessage(func(msg *berty.Message, cmeta *berty.ConnMetadata)) {
	// doing nothing, enqueuer does not support receiving events
}

func (e *Enqueuer) PingOtherNode(ctx context.Context, destination string) error {
	tracer := tracing.EnterFunc(ctx, destination)
	defer tracer.Finish()
	// ctx = tracer.Context()

	e.pingQueue <- destination
	return nil
}

func (e *Enqueuer) SetLocalContactID(lcontactID string) {
	e.localContactID = lcontactID
}

func (e *Enqueuer) Join() error {
	tracer := tracing.EnterFunc(context.Background(), e.localContactID)
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
