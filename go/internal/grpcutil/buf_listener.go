package grpcutil

import (
	"context"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
)

type BufListener struct {
	*bufconn.Listener
	ctx context.Context
}

func NewBufListener(ctx context.Context, sz int) *BufListener {
	return &BufListener{
		Listener: bufconn.Listen(sz),
		ctx:      ctx,
	}
}

func (bl *BufListener) NewClientConn(opts ...grpc.DialOption) (*grpc.ClientConn, error) {
	dialer := func(context.Context, string) (net.Conn, error) {
		return bl.Dial()
	}

	baseOpts := []grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithContextDialer(dialer), // set pipe dialer
	}

	return grpc.DialContext(
		bl.ctx,
		"buf",
		append(opts, baseOpts...)...)
}
