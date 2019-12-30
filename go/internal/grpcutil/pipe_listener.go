package grpcutil

import (
	"context"
	"fmt"
	"net"
	"sync"

	"google.golang.org/grpc"
)

type PipeListener struct {
	cancel context.CancelFunc
	ctx    context.Context
	cconn  chan net.Conn
	once   sync.Once
}

func NewPipeListener() *PipeListener {
	ctx, cancel := context.WithCancel(context.Background())
	return &PipeListener{
		cancel: cancel,
		ctx:    ctx,
		cconn:  make(chan net.Conn, 1),
	}
}

// Add conn forward the given conn to the listener
func (pl *PipeListener) AddConn(c net.Conn) {
	select {
	case <-pl.ctx.Done():
	case pl.cconn <- c:
	}
}

// NewClientConn return a grpc conn connected with the listener
func (pl *PipeListener) NewClientConn(opts ...grpc.DialOption) (conn *grpc.ClientConn, err error) {
	// create pipe dialer
	dialer := func(context.Context, string) (net.Conn, error) {
		cclient, cserver := net.Pipe()
		pl.AddConn(cserver)
		return cclient, nil
	}

	baseOpts := []grpc.DialOption{
		grpc.WithContextDialer(dialer), // set pipe dialer
	}

	conn, err = grpc.DialContext(pl.ctx, "pipe", append(opts, baseOpts...)...)
	return
}

// Listener
var _ net.Listener = (*PipeListener)(nil)

func (pl *PipeListener) Addr() net.Addr { return pl }
func (pl *PipeListener) Accept() (net.Conn, error) {
	select {
	case conn := <-pl.cconn:
		if conn != nil {
			return conn, nil
		}
	case <-pl.ctx.Done():
		return nil, pl.ctx.Err()
	}

	return nil, fmt.Errorf("pipe listener is closing")
}
func (pl *PipeListener) Close() error {
	pl.cancel()
	pl.once.Do(func() { close(pl.cconn) })
	return nil
}

// Addr
var _ net.Addr = (*PipeListener)(nil)

func (pl *PipeListener) Network() string { return "pipe_network" }
func (pl *PipeListener) String() string  { return "pipe" }
