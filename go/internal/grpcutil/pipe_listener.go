package grpcutil

import (
	"context"
	"fmt"
	"net"

	"google.golang.org/grpc"
)

type PipeListener struct {
	cancel context.CancelFunc
	ctx    context.Context
	cconn  chan net.Conn
}

func NewPipeListener() *PipeListener {
	ctx, cancel := context.WithCancel(context.Background())
	return &PipeListener{
		cancel: cancel,
		ctx:    ctx,
		cconn:  make(chan net.Conn),
	}
}

// NewClientConn return a grpc conn connected with the listener
func (pl *PipeListener) NewClientConn(opts ...grpc.DialOption) (conn *grpc.ClientConn, err error) {
	// create pipe dialer
	dialer := func(ctx context.Context, _ string) (net.Conn, error) {
		cclient, cserver := net.Pipe()
		return cclient, pl.addConn(ctx, cserver)
	}

	baseOpts := []grpc.DialOption{
		grpc.WithContextDialer(dialer), // set pipe dialer
	}

	conn, err = grpc.DialContext(pl.ctx, "pipe", append(opts, baseOpts...)...)
	return
}

// Add conn forward the given conn to the listener
func (pl *PipeListener) addConn(ctx context.Context, c net.Conn) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-pl.ctx.Done():
		return fmt.Errorf("pipe listener has been closed")
	case pl.cconn <- c:
		return nil
	}
}

// Listener
var _ net.Listener = (*PipeListener)(nil)

func (pl *PipeListener) Addr() net.Addr { return pl }
func (pl *PipeListener) Accept() (net.Conn, error) {
	var conn net.Conn

	select {
	case conn = <-pl.cconn:
	case <-pl.ctx.Done():
		return nil, pl.ctx.Err()
	}

	if conn == nil {
		return nil, fmt.Errorf("pipe listener is closing")
	}

	return conn, nil
}
func (pl *PipeListener) Close() error {
	pl.cancel()
	return nil
}

// Addr
var _ net.Addr = (*PipeListener)(nil)

func (pl *PipeListener) Network() string { return "pipe_network" }
func (pl *PipeListener) String() string  { return "pipe" }
