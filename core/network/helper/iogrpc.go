package helper

import (
	"io"
	"net"
	"time"
)

type IOGrpc struct {
	conn chan net.Conn
}

func NewIOGrpc() *IOGrpc {
	return &IOGrpc{
		conn: make(chan net.Conn, 1),
	}
}

func (gi *IOGrpc) NewDialer() func(string, time.Duration) (net.Conn, error) {
	return func(_ string, _ time.Duration) (net.Conn, error) {
		cdialer, clistener := newIOConns()
		gi.conn <- clistener
		return cdialer, nil
	}
}

func (gi *IOGrpc) Listener() net.Listener {
	return (*ioListener)(gi)
}

var _ net.Addr = (*ioAddr)(nil)

type ioAddr struct{}

func (ic *ioAddr) Network() string {
	return "io_reader/writer"
}

func (ic *ioAddr) String() string {
	return "io_reader/writer"
}

var ioaddr = &ioAddr{}

var _ net.Listener = (*ioListener)(nil)

type ioListener IOGrpc

// Accept waits for and returns the next connection to the listener.
func (il *ioListener) Accept() (net.Conn, error) {
	return <-il.conn, nil
}

// Close closes the listener.
// Any blocked Accept operations will be unblocked and return errors.
func (il *ioListener) Close() error {
	return nil
}

// Addr returns the listener's network address.
func (il *ioListener) Addr() net.Addr {
	return ioaddr
}

var _ net.Conn = (*ioConn)(nil)

type ioConn struct {
	pr *io.PipeReader
	pw *io.PipeWriter
}

func newIOConns() (a *ioConn, b *ioConn) {
	apr, apw := io.Pipe()
	bpr, bpw := io.Pipe()

	a = &ioConn{
		pr: apr,
		pw: bpw,
	}

	b = &ioConn{
		pr: bpr,
		pw: apw,
	}

	return
}

// Conn is a generic stream-oriented network connection.
//
// Multiple goroutines may invoke methods on a Conn simultaneously.
// Read reads data from the connection.
// Read can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetReadDeadline.
func (ic *ioConn) Read(b []byte) (n int, err error) {
	return ic.pr.Read(b)
}

// Write writes data to the connection.
// Write can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetWriteDeadline.
func (ic *ioConn) Write(b []byte) (n int, err error) {
	return ic.pw.Write(b)
}

// Close closes the connection.
// Any blocked Read or Write operations will be unblocked and return errors.
func (ic *ioConn) Close() error {
	if err := ic.pw.Close(); err != nil {
		return err
	}

	return ic.pr.Close()
}

// LocalAddr returns the local network address.
func (ic *ioConn) LocalAddr() net.Addr {
	return ioaddr
}

// RemoteAddr returns the remote network address.
func (ic *ioConn) RemoteAddr() net.Addr {
	return ioaddr
}

// SetDeadline sets the read and write deadlines associated
// with the connection. It is equivalent to calling both
// SetReadDeadline and SetWriteDeadline.
//
// A deadline is an absolute time after which I/O operations
// fail with a timeout (see type Error) instead of
// blocking. The deadline applies to all future and pending
// I/O, not just the immediately following call to Read or
// Write. After a deadline has been exceeded, the connection
// can be refreshed by setting a deadline in the future.
//
// An idle timeout can be implemented by repeatedly extending
// the deadline after successful Read or Write calls.
//
// A zero value for t means I/O operations will not time out.
func (ic *ioConn) SetDeadline(t time.Time) error {
	return nil
}

// SetReadDeadline sets the deadline for future Read calls
// and any currently-blocked Read call.
// A zero value for t means Read will not time out.
func (ic *ioConn) SetReadDeadline(t time.Time) error {
	return nil
}

// SetWriteDeadline sets the deadline for future Write calls
// and any currently-blocked Write call.
// Even if write times out, it may return n > 0, indicating that
// some of the data was successfully written.
// A zero value for t means Write will not time out.
func (ic *ioConn) SetWriteDeadline(t time.Time) error {
	return nil
}
