package proximitytransport

import (
	"context"
	"fmt"
	"io"
	"net"
	"sync"
	"time"

	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
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

	ready bool
	sync.Mutex
	cache *RingBufferMap
	mp    *mplex

	ctx       context.Context
	cancel    func()
	transport *proximityTransport
}

// newConn returns an inbound or outbound tpt.CapableConn upgraded from a Conn.
func newConn(ctx context.Context, t *proximityTransport, remoteMa ma.Multiaddr,
	remotePID peer.ID, inbound bool) (tpt.CapableConn, error) {
	t.logger.Debug("newConn()", logutil.PrivateString("remoteMa", remoteMa.String()), zap.Bool("inbound", inbound))

	// Creates a manet.Conn
	pr, pw := io.Pipe()
	connCtx, cancel := context.WithCancel(t.listener.ctx)

	maconn := &Conn{
		readIn:    pw,
		readOut:   pr,
		localMa:   t.listener.localMa,
		remoteMa:  remoteMa,
		ready:     false,
		cache:     NewRingBufferMap(t.logger, 128),
		mp:        newMplex(connCtx, t.logger),
		ctx:       connCtx,
		cancel:    cancel,
		transport: t,
	}

	// Stores the conn in connMap, will be deleted during conn.Close()
	t.connMapMutex.Lock()
	t.connMap[maconn.RemoteAddr().String()] = maconn
	t.connMapMutex.Unlock()

	// Configure mplex and run it
	maconn.mp.addInputCache(t.cache)
	maconn.mp.addInputCache(maconn.cache)
	maconn.mp.setOutput(pw)

	// Returns an upgraded CapableConn (muxed, addr filtered, secured, etc...)
	if inbound {
		return t.upgrader.UpgradeInbound(ctx, t, maconn)
	}
	return t.upgrader.UpgradeOutbound(ctx, t, maconn, remotePID)
}

// Read reads data from the connection.
// Timeout handled by the native driver.
func (c *Conn) Read(payload []byte) (n int, err error) {
	c.transport.logger.Debug("Conn.Read", logutil.PrivateString("remoteAddr", c.RemoteAddr().String()))
	if c.ctx.Err() != nil {
		c.transport.logger.Error("Conn.Read failed: conn already closed")
		return 0, fmt.Errorf("error: Conn.Read failed: conn already closed")
	}

	n, err = c.readOut.Read(payload)
	if err != nil {
		err = errors.Wrap(err, "error: Conn.Read failed: native read failed")
		c.transport.logger.Error("Conn.Read", zap.Error(err))
	} else {
		c.transport.logger.Debug("Conn.Read successful")
	}
	return n, err
}

// Write writes data to the connection.
// Timeout handled by the native driver.
func (c *Conn) Write(payload []byte) (n int, err error) {
	c.transport.logger.Debug("Conn.Write", logutil.PrivateString("remoteAddr", c.RemoteAddr().String()), logutil.PrivateBinary("payload", payload))
	if c.ctx.Err() != nil {
		return 0, fmt.Errorf("error: Conn.Write failed: conn already closed")
	}

	// Set connection as ready and flush cached payloads
	if !c.isReady() {
		c.Lock()
		if !c.ready {
			c.ready = true
		}
		c.Unlock()
		go c.mp.run(c.RemoteAddr().String())
	}

	// Write to the peer's device using native driver.
	if !c.transport.driver.SendToPeer(c.RemoteAddr().String(), payload) {
		c.transport.logger.Error("Conn.Write failed")
		return 0, fmt.Errorf("error: Conn.Write failed: native write failed")
	}
	c.transport.logger.Debug("Conn.Write successful")

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
	c.transport.connMapMutex.Lock()
	delete(c.transport.connMap, c.RemoteAddr().String())
	c.transport.connMapMutex.Unlock()

	// Disconnect the driver
	c.transport.driver.CloseConnWithPeer(c.RemoteAddr().String())

	return nil
}

// isReady tells if  libp2p is ready to accept input connections
func (c *Conn) isReady() bool {
	c.Lock()
	defer c.Unlock()
	return c.ready
}

// LocalAddr returns the local network address.
func (c *Conn) LocalAddr() net.Addr {
	lAddr, _ := c.LocalMultiaddr().ValueForProtocol(c.transport.driver.ProtocolCode())
	return &Addr{
		Address:   lAddr,
		transport: c.transport,
	}
}

// RemoteAddr returns the remote network address.
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

// SetDeadline does nothing
func (c *Conn) SetDeadline(t time.Time) error { return nil }

// SetReadDeadline does nothing
func (c *Conn) SetReadDeadline(t time.Time) error { return nil }

// SetWriteDeadline does nothing
func (c *Conn) SetWriteDeadline(t time.Time) error { return nil }
