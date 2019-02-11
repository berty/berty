package bot

import (
	"encoding/json"

	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/core/api/client"
	"berty.tech/core/api/node"
	"berty.tech/core/entity"
)

type Option func(b *Bot) error

func WithTCPDaemon(addr string) Option {
	return func(b *Bot) error {
		conn, err := grpc.Dial(addr, grpc.WithInsecure())
		if err != nil {
			return err
		}
		return WithGRPCConn(conn)(b)
	}
}

func WithDefaultDaemon() Option {
	return WithTCPDaemon("127.0.0.1:1337")
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
			if e.Kind != entity.Kind_ContactRequest || !e.IsJustReceived() {
				return nil
			}
			_, err := b.client.Node().ContactAcceptRequest(e.ctx, &node.ContactAcceptRequestInput{
				ContactID: e.SenderID,
			})
			return err
		})
		return nil
	}
}

func WithMessageHandlerFunc(f MessageHandlerFunc) Option {
	return func(b *Bot) error {
		b.AddMessageHandlerFunc(f)
		return nil
	}
}

func WithLogger() Option {
	return func(b *Bot) error {
		b.AddHandlerFunc(func(_ *Bot, e *Event) error {
			out, _ := json.Marshal(e)
			logger().Debug("received event", zap.String("event", string(out)))
			return nil
		})
		return nil
	}
}
