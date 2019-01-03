package bot

import (
	"context"
	"io"
	"time"

	"berty.tech/core/api/client"
	"berty.tech/core/api/node"
	"berty.tech/core/pkg/tracing"
)

type Bot struct {
	client      *client.Client
	handlers    []Handler
	rootContext context.Context
}

func New(ctx context.Context, opts ...Option) (*Bot, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	bot := Bot{
		handlers:    make([]Handler, 0),
		rootContext: ctx,
	}

	for _, opt := range opts {
		if err := opt(&bot); err != nil {
			return nil, err
		}
	}

	if bot.client == nil {
		return nil, ErrNoClient
	}

	return &bot, nil
}

func (b *Bot) Start() error {
	tracer := tracing.EnterFunc(b.rootContext)
	defer tracer.Finish()
	ctx := tracer.Context()

	stream, err := b.client.Node().EventStream(ctx, &node.EventStreamInput{})
	if err != nil {
		return err
	}
	for {
		time.Sleep(1000 * time.Millisecond)
		event, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		botEvent := &Event{
			Event: *event,
			ctx:   stream.Context(),
		}

		// give some time to avoid race conditions
		// should be fixed when we will have setup
		// all the required mutexes everywhere
		time.Sleep(100 * time.Millisecond)

		for _, handler := range b.handlers {
			if err := handler.Handle(b, botEvent); err != nil {
				return err
			}
		}
	}
	return nil
}
