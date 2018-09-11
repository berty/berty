package bot

import (
	"context"
	"io"
	"time"

	"berty.tech/core/api/client"
	"berty.tech/core/api/node"
)

type Bot struct {
	client   *client.Client
	handlers []Handler
}

func New(opts ...Option) (*Bot, error) {
	bot := Bot{
		handlers: make([]Handler, 0),
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
	ctx := context.Background()
	stream, err := b.client.Node().EventStream(ctx, &node.EventStreamInput{})
	if err != nil {
		return err
	}
	for {
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
