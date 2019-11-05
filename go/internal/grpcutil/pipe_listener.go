package grpcutil

import (
	"fmt"
	"net"
	"sync"
)

type PipeListener struct {
	cconn chan net.Conn
	once  sync.Once
}

func NewPipeListener() *PipeListener {
	return &PipeListener{
		cconn: make(chan net.Conn, 1),
	}
}

func (pl *PipeListener) AddConn(c net.Conn) { pl.cconn <- c }

// Listener
var _ net.Listener = (*PipeListener)(nil)

func (pl *PipeListener) Addr() net.Addr { return pl }
func (pl *PipeListener) Accept() (net.Conn, error) {
	if conn := <-pl.cconn; conn != nil {
		return conn, nil
	}

	return nil, fmt.Errorf("pipe listener is closing")
}
func (pl *PipeListener) Close() error {
	pl.once.Do(func() { close(pl.cconn) })
	return nil
}

// Addr
var _ net.Addr = (*PipeListener)(nil)

func (pl *PipeListener) Network() string { return "pipe_network" }
func (pl *PipeListener) String() string  { return "pipe" }
