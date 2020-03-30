package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/grpcutil"
	"google.golang.org/grpc"
)

type Client interface {
	ProtocolServiceClient

	Close() error
}

type client struct {
	ProtocolServiceClient

	l *grpcutil.PipeListener
}

func (c *client) Close() error {
	return c.l.Close()
}

func NewClient(svc Service) (Client, error) {
	return NewClientFromServer(grpc.NewServer(), svc)
}

func NewClientFromServer(s *grpc.Server, svc Service) (Client, error) {
	pl := grpcutil.NewPipeListener()

	cc, err := pl.NewClientConn(grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	RegisterProtocolServiceServer(s, svc)

	go func() {
		_ = s.Serve(pl)
	}()

	c := client{ProtocolServiceClient: NewProtocolServiceClient(cc), l: pl}
	return &c, nil
}
