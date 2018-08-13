package bot

import (
	grpc "google.golang.org/grpc"

	"github.com/berty/berty/core/api/client"
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
