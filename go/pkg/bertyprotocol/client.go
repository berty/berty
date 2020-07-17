package bertyprotocol

import (
	"berty.tech/berty/v2/go/internal/grpcutil"
	"google.golang.org/grpc"
)

const ClientBufferSize = 256 * 1024

type Client interface {
	ProtocolServiceClient

	Close() error
}

type client struct {
	ProtocolServiceClient

	l *grpcutil.BufListener
}

func (c *client) Close() error {
	return c.l.Close()
}

func NewClient(svc Service, opts ...grpc.ServerOption) (Client, error) {
	return NewClientFromServer(grpc.NewServer(opts...), svc)
}

func NewClientFromServer(s *grpc.Server, svc Service, opts ...grpc.DialOption) (Client, error) {
	bl := grpcutil.NewBufListener(ClientBufferSize)
	cc, err := bl.NewClientConn(opts...)
	if err != nil {
		return nil, err
	}

	RegisterProtocolServiceServer(s, svc)
	go func() {
		err := s.Serve(bl)
		if err != nil && err.Error() != "closed" {
			panic(err)
		}
	}()

	c := client{
		ProtocolServiceClient: NewProtocolServiceClient(cc),
		l:                     bl,
	}
	return &c, nil
}
