package proximitytransport

import (
	"context"
	"fmt"
	"io"
	"net"
	"time"

	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/pkg/errors"
)

// Conn is a manet.Conn.
var _ manet.Conn = &Conn{}

// Conn is the equivalent of a net.Conn object. It is the
// result of calling the Dial or Listen functions in this
// package, with associated local and remote Multiaddrs.
type Conn struct {
	readIn  *io.PipeWriter
	readOut *io.PipeReader

	localMa  ma.Multiaddr
	remoteMa ma.Multiaddr

	ctx       context.Context
	cancel    func()
	transport *proximityTransport
}

// Read reads data from the connection.
// Timeout handled by the native driver.
func (c *Conn) Read(payload []byte) (n int, err error) {
	if c.ctx.Err() != nil {
		return 0, fmt.Errorf("error: Conn.Read failed: conn already closed")
	}

	n, err = c.readOut.Read(payload)
	if err != nil {
		err = errors.Wrap(err, "error: Conn.Read failed: native read failed")
	}

	return n, err
}

// Write writes data to the connection.
// Timeout handled by the native driver.
func (c *Conn) Write(payload []byte) (n int, err error) {
	if c.ctx.Err() != nil {
		return 0, fmt.Errorf("error: Conn.Write failed: conn already closed")
	}

	// Write to the peer's device using native driver.
	if !c.transport.driver.SendToPeer(c.RemoteAddr().String(), payload) {
		c.transport.logger.Debug("Conn.Write failed")
		return 0, fmt.Errorf("error: Conn.Write failed: native write failed")
	}

	return len(payload), nil
}

// Close closes the connection.
// Any blocked Read or Write operations will be unblocked and return errors.
func (c *Conn) Close() error {
	c.transport.logger.Debug("Conn.Close()")
	c.cancel()

	// Closes read pipe
	c.readIn.Close()
	c.readOut.Close()

	// Removes conn from connmgr's connMap
	c.transport.connMap.Delete(c.RemoteAddr().String())

	return nil
}

// LocalAddr returns the local network address.
func (c *Conn) LocalAddr() net.Addr {
	lAddr, _ := c.LocalMultiaddr().ValueForProtocol(c.transport.driver.ProtocolCode())
	return &Addr{
		Address:   lAddr,
		transport: c.transport,
	}
}

// LocalAddr returns the remote network address.
func (c *Conn) RemoteAddr() net.Addr {
	rAddr, _ := c.RemoteMultiaddr().ValueForProtocol(c.transport.driver.ProtocolCode())
	return &Addr{
		Address:   rAddr,
		transport: c.transport,
	}
}

// LocalMultiaddr returns the local Multiaddr associated
// with this connection.
func (c *Conn) LocalMultiaddr() ma.Multiaddr { return c.localMa }

// RemoteMultiaddr returns the remote Multiaddr associated
// with this connection.
func (c *Conn) RemoteMultiaddr() ma.Multiaddr { return c.remoteMa }

// Noop deadline methods, handled by the native driver.
func (c *Conn) SetDeadline(t time.Time) error      { return nil }
func (c *Conn) SetReadDeadline(t time.Time) error  { return nil }
func (c *Conn) SetWriteDeadline(t time.Time) error { return nil }
