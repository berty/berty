package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/grpcutil"
	grpc "google.golang.org/grpc"
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

func NewClientFromServer(s *grpc.Server, svc Service) (c Client, err error) {
	pl := grpcutil.NewPipeListener()

	var cc *grpc.ClientConn
	if cc, err = pl.NewClientConn(grpc.WithInsecure()); err != nil {
		return
	}

	RegisterProtocolServiceServer(s, svc)

	go s.Serve(pl)

	c = &client{
		ProtocolServiceClient: NewProtocolServiceClient(cc),
		l:                     pl,
	}

	return
}
