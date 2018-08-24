package bot

import (
	"encoding/json"
	"log"

	grpc "google.golang.org/grpc"

	"berty.tech/core/api/client"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

type Option func(b *Bot) error

func WithDefaultDaemon() Option {
	return func(b *Bot) error {
		conn, err := grpc.Dial("127.0.0.1:1337", grpc.WithInsecure())
		if err != nil {
			return err
		}
		return WithGRPCConn(conn)(b)
	}
}

func WithGRPCConn(conn *grpc.ClientConn) Option {
	return func(b *Bot) error {
		b.client = client.New(conn)
		return nil
	}
}

func WithClient(client *client.Client) Option {
	return func(b *Bot) error {
		b.client = client
		return nil
	}
}

func WithAutoAcceptInvites() Option {
	return func(b *Bot) error {
		b.AddHandlerFunc(func(b *Bot, e *Event) error {
			if e.Kind != p2p.Kind_ContactRequest {
				return nil
			}

			_, err := b.client.Node().ContactAcceptRequest(e.ctx, &entity.Contact{
				ID: e.SenderID,
			})
			return err
		})
		return nil
	}
}

func WithLogger() Option {
	return func(b *Bot) error {
		b.AddHandlerFunc(func(_ *Bot, e *Event) error {
			out, _ := json.Marshal(e)
			log.Println("received event", string(out))
			return nil
		})
		return nil
	}
}
