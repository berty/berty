package bot

import (
	"context"
	"io"

	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/client"
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

func (b *Bot) Run() error {
	ctx := context.Background()
	stream, err := b.client.Node().EventStream(ctx, &node.Void{})
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
			*event,
		}
		for _, handler := range b.handlers {
			if err := handler.Handle(b, botEvent); err != nil {
				return err
			}
		}
	}
	return nil
}
