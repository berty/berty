package ble

import (
	"context"
	"fmt"
	"net"
	"time"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	blema "berty.tech/core/network/protocol/ble/multiaddr"

	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

// Conn is a BLE manet.Conn.
var _ manet.Conn = &Conn{}

// Conn is the equivalent of a net.Conn object. It is the
// result of calling the Dial or Listen functions in this
// package, with associated local and remote Multiaddrs.
type Conn struct {
	localMa  ma.Multiaddr
	remoteMa ma.Multiaddr

	incomingData  chan []byte
	remainingData []byte

	ctx    context.Context
	cancel func()
}

// Read reads data from the connection.
// Timeout handled by the native driver.
func (c *Conn) Read(payload []byte) (n int, err error) {
	logger().Debug("READ CALLED")
	// If data remains from the last call, reads it.
	if c.remainingData != nil && len(c.remainingData) > 0 {
		copied := copy(payload, c.remainingData)
		c.remainingData = c.remainingData[copied:]
		return copied, nil
	}

	select {
	case c.remainingData = <-c.incomingData:
		logger().Debug("READ CALLED FOR CONN" + c.RemoteAddr().String())
		copied := copy(payload, c.remainingData)
		c.remainingData = c.remainingData[copied:]
		return copied, nil
	case <-c.ctx.Done():
		return 0, fmt.Errorf("conn read failed: conn already closed")
	}
}

// Write writes data to the connection.
// Timeout handled by the native driver.
func (c *Conn) Write(payload []byte) (n int, err error) {
	logger().Debug("WRITE CALLED FOR CONN" + c.RemoteAddr().String())
	if c.ctx.Err() != nil {
		return 0, fmt.Errorf("conn write failed: conn already closed")
	}

	// Write to the peer's device using native driver.
	if bledrv.SendToDevice(c.RemoteAddr().String(), payload) == false {
		return 0, fmt.Errorf("conn write failed: native write failed")
	}

	return len(payload), nil
}

// Close closes the connection.
// Any blocked Read or Write operations will be unblocked and return errors.
func (c *Conn) Close() error {
	logger().Debug("CLOSE CALLED FOR CONN" + c.RemoteAddr().String())
	c.cancel()

	// Notify the native driver that the conn was cloed with this device.
	bledrv.CloseConnWithDevice(c.RemoteAddr().String())

	return nil
}

// LocalAddr returns the local network address.
func (c *Conn) LocalAddr() net.Addr {
	lAddr, _ := c.LocalMultiaddr().ValueForProtocol(blema.P_BLE)
	return &Addr{
		Address: lAddr,
	}
}

// LocalAddr returns the remote network address.
func (c *Conn) RemoteAddr() net.Addr {
	rAddr, _ := c.RemoteMultiaddr().ValueForProtocol(blema.P_BLE)
	return &Addr{
		Address: rAddr,
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
