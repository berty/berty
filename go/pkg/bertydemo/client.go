package bertydemo

import (
	"berty.tech/berty/v2/go/internal/grpcutil"
	grpc "google.golang.org/grpc"
)

type Client interface {
	DemoServiceClient

	Close() error
}

type client struct {
	DemoServiceClient

	l *grpcutil.PipeListener
}

func (c *client) Close() error {
	return c.l.Close()
}

func NewClient(svc *Service) (Client, error) {
	return NewClientFromServer(grpc.NewServer(), svc)
}

func NewClientFromServer(s *grpc.Server, svc *Service) (c Client, err error) {
	pl := grpcutil.NewPipeListener()

	var cc *grpc.ClientConn
	if cc, err = pl.NewClientConn(grpc.WithInsecure()); err != nil {
		return
	}

	RegisterDemoServiceServer(s, svc)

	go s.Serve(pl)

	c = &client{
		DemoServiceClient: NewDemoServiceClient(cc),
		l:                 pl,
	}

	return
}
