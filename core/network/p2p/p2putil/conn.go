package p2putil

import (
	"net"
	"time"

	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	manet "github.com/multiformats/go-multiaddr-net"
	"go.uber.org/zap"
)

// ProtocolAddr is a net.Addr
var _ net.Addr = (*ProtocolAddr)(nil)

// ProtocolAddr implement net.Addr for protocol.ID
// this doesn't really make sense, only there for implementation purpose of net.Addr
type ProtocolAddr struct {
	Address string
}

func (pa *ProtocolAddr) Network() string {
	return pa.String()
}

func (pa *ProtocolAddr) String() string {
	return string(pa.Address)
}

// conn must implement net.conn
var _ net.Listener = (*listener)(nil)

type fclose func() error

type listener struct {
	cstream chan net.Conn
	addr    *ProtocolAddr
	fc      fclose
}

func NewListener(fc fclose, pid protocol.ID) (net.Listener, inet.StreamHandler) {
	l := &listener{
		cstream: make(chan net.Conn, 256), // yamux default pool size
		addr:    &ProtocolAddr{Address: string(pid)},
		fc:      fc,
	}
	return l, l.handleStream
}

func (l *listener) handleStream(s inet.Stream) {
	c, err := NewConnFromStream(s)
	if err != nil {
		logger().Warn("Handle stream error", zap.Error(err))
		return
	}
	l.cstream <- c
}

func (l *listener) Accept() (net.Conn, error) {
	return <-l.cstream, nil
}

func (l *listener) Close() error {
	return l.fc()
}

func (l *listener) Addr() net.Addr {
	return l.addr
}

// Conn must implement net.conn
var _ net.Conn = (*conn)(nil)

type conn struct {
	s          inet.Stream
	localAddr  net.Addr
	remoteAddr net.Addr
}

// NewConnFromStream convert a inet.Stream to a net.conn
func NewConnFromStream(s inet.Stream) (net.Conn, error) {
	var localAddr, remoteAddr net.Addr
	var err error

	localAddr, err = manet.ToNetAddr(s.Conn().LocalMultiaddr())
	if err != nil || localAddr.String() == "" {
		localAddr = &ProtocolAddr{Address: s.Conn().LocalMultiaddr().String()}
	}

	remoteAddr, err = manet.ToNetAddr(s.Conn().RemoteMultiaddr())
	if err != nil || remoteAddr.String() == "" {
		remoteAddr = &ProtocolAddr{Address: s.Conn().RemoteMultiaddr().String()}
	}

	return &conn{s, localAddr, remoteAddr}, nil
}

// Read reads data from the connection.
// Read can be made to time out and return an Error with Timeout() == true
// after a fixed time limit; see SetDeadline and SetReadDeadline.
func (c *conn) Read(b []byte) (n int, err error) { // good
	return c.s.Read(b)
}

// Close closes the connection.
// Any blocked Read or Write operations will be unblocked and return errors.
func (c *conn) Write(b []byte) (n int, err error) { // good
	return c.s.Write(b)
}

// Close closes the connection.
// Any blocked Read or Write operations will be unblocked and return errors.
func (c *conn) Close() error { // good
	return c.s.Reset()
}

// LocalAddr returns the local network address.
func (c *conn) LocalAddr() net.Addr {
	return c.localAddr
}

// RemoteAddr returns the remote network address.
func (c *conn) RemoteAddr() net.Addr {
	return c.remoteAddr
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
func (c *conn) SetDeadline(t time.Time) error {
	return c.s.SetDeadline(t)
}

// SetReadDeadline sets the deadline for future Read calls
// and any currently-blocked Read call.
// A zero value for t means Read will not time out.
func (c *conn) SetReadDeadline(t time.Time) error {
	return c.s.SetReadDeadline(t)
}

// SetWriteDeadline sets the deadline for future Write calls
// and any currently-blocked Write call.
// Even if write times out, it may return n > 0, indicating that
// some of the data was successfully written.
// A zero value for t means Write will not time out.
func (c *conn) SetWriteDeadline(t time.Time) error {
	return c.s.SetWriteDeadline(t)
}
