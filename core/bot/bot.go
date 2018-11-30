package bot

import (
	"context"
	"fmt"
	"io"
	"time"

	"berty.tech/core/api/client"
	"berty.tech/core/api/node"
	"berty.tech/core/pkg/tracing"
	opentracing "github.com/opentracing/opentracing-go"
)

type Bot struct {
	client      *client.Client
	handlers    []Handler
	rootContext context.Context
}

func New(ctx context.Context, opts ...Option) (*Bot, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx)
	defer span.Finish()

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
	span, _ := tracing.EnterFunc(b.rootContext)
	defer span.Finish()

	stream, err := b.client.Node().EventStream(b.rootContext, &node.EventStreamInput{})
	if err != nil {
		return err
	}
	for {
		fmt.Println("for")
		time.Sleep(1000 * time.Millisecond)
		event, err := stream.Recv()
		fmt.Println("event", event, err)
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
