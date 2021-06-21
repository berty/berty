package bertyprotocol

import (
	"context"

	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const ClientBufferSize = 4 * 1024 * 1024

type Client interface {
	protocoltypes.ProtocolServiceClient

	Close() error
}

type client struct {
	protocoltypes.ProtocolServiceClient

	l  *grpcutil.BufListener
	cc *grpc.ClientConn
}

type embeddedClient struct {
	Client
	server *grpc.Server
}

func (c *client) Close() error {
	c.cc.Close()
	return c.l.Close()
}

func (c *embeddedClient) Close() error {
	_ = c.Client.Close()
	c.server.Stop()

	return nil
}

func NewClient(ctx context.Context, svc Service, clientOpts []grpc.DialOption, serverOpts []grpc.ServerOption) (Client, error) {
	s := grpc.NewServer(serverOpts...)

	c, err := NewClientFromServer(ctx, s, svc, clientOpts...)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &embeddedClient{
		Client: c,
		server: s,
	}, nil
}

func NewClientFromServer(ctx context.Context, s *grpc.Server, svc Service, opts ...grpc.DialOption) (Client, error) {
	bl := grpcutil.NewBufListener(ctx, ClientBufferSize)
	cc, err := bl.NewClientConn(opts...)
	if err != nil {
		return nil, err
	}

	protocoltypes.RegisterProtocolServiceServer(s, svc)
	go func() {
		err := s.Serve(bl)
		if err != nil && !(err == grpc.ErrServerStopped || err.Error() == "closed") {
			panic(err)
		}
	}()

	c := client{ProtocolServiceClient: protocoltypes.NewProtocolServiceClient(cc), cc: cc, l: bl}
	return &c, nil
}
