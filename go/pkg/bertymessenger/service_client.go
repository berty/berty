package bertymessenger

import (
	"context"
	"fmt"
	"io"
	"time"

	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/pkg/grpcutil"
	"berty.tech/weshnet/pkg/protocoltypes"
)

const ClientBufferSize = 4 * 1024 * 1024

type ServiceClient interface {
	messengertypes.MessengerServiceClient

	io.Closer
}

type serviceClient struct {
	ServiceClient // inehrit from client

	service Service
	server  *grpc.Server
}

func NewServiceClient(wesh protocoltypes.ProtocolServiceClient, opts *Opts) (ServiceClient, error) {
	svc, err := New(wesh, opts)
	if err != nil {
		return nil, err
	}

	s := grpc.NewServer()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	c, err := NewClientFromService(ctx, s, svc)
	if err != nil {
		return nil, fmt.Errorf("uanble to create client from server: %w", err)
	}

	return &serviceClient{
		ServiceClient: c,
		server:        s,
		service:       svc,
	}, nil
}

func (c *serviceClient) Close() error {
	c.server.GracefulStop()     // gracefully stop grpc server
	_ = c.ServiceClient.Close() // close client and discard error
	c.service.Close()           // close service
	return nil
}

type client struct {
	messengertypes.MessengerServiceClient

	l  *grpcutil.BufListener
	cc *grpc.ClientConn
}

func (c *client) Close() error {
	err := c.cc.Close()
	_ = c.l.Close()
	return err
}

func NewClientFromService(ctx context.Context, s *grpc.Server, svc Service, opts ...grpc.DialOption) (ServiceClient, error) {
	bl := grpcutil.NewBufListener(ClientBufferSize)
	cc, err := bl.NewClientConn(ctx, opts...)
	if err != nil {
		return nil, err
	}

	messengertypes.RegisterMessengerServiceServer(s, svc)
	go func() {
		// we dont need to log the error
		_ = s.Serve(bl)
	}()

	return &client{
		MessengerServiceClient: messengertypes.NewMessengerServiceClient(cc),
		cc:                     cc,
		l:                      bl,
	}, nil
}
