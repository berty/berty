package main

import (
	"context"
	"time"

	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type client struct {
	messengertypes.MessengerServiceClient
	close func() error
}

func newClient(addr string) (*client, error) {
	connCtx, cancelDial := context.WithTimeout(context.Background(), time.Second*2)
	defer cancelDial()
	conn, err := grpc.DialContext(connCtx, addr, grpc.WithInsecure(), grpc.WithBlock())
	if err != nil {
		return nil, errors.Wrap(err, "failed to dial messenger daemon")
	}
	return &client{
		MessengerServiceClient: messengertypes.NewMessengerServiceClient(conn),
		close:                  conn.Close,
	}, nil
}

func (c *client) Close() error {
	if c.close != nil {
		return c.close()
	}
	return nil
}
