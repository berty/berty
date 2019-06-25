package ble

import (
	"fmt"
	"net"
	"time"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	blema "berty.tech/core/network/protocol/ble/multiaddr"
	ic "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	smu "github.com/libp2p/go-stream-muxer"
	yamux "github.com/libp2p/go-yamux"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// TODO: Check if there is a simplier way to implement this using recent
// libp2p features
type Conn struct {
	nConn         net.Conn // For yamux
	sess          *yamux.Session
	incomingData  chan []byte
	remainingData []byte

	tConn     tpt.Conn // For libp2p
	transport *Transport
	localID   peer.ID
	remoteID  peer.ID
	localMa   ma.Multiaddr
	remoteMa  ma.Multiaddr

	// Common
	closed bool
	closer chan struct{}
}

// Implement net.Conn interface
// See https://golang.org/pkg/net/#Conn
func (c *Conn) Read(p []byte) (n int, err error) {
	if c.remainingData != nil && len(c.remainingData) > 0 {
		// Read remaining data left in last call.
		copied := copy(p, c.remainingData)
		c.remainingData = c.remainingData[copied:]
		return copied, nil
	}

	select {
	case c.remainingData = <-c.incomingData:
		copied := copy(p, c.remainingData)
		c.remainingData = c.remainingData[copied:]
		return copied, nil
	case <-c.closer:
		return 0, fmt.Errorf("conn read failed: conn already closed")
	}
}

func (c *Conn) Write(p []byte) (n int, err error) {
	if c.IsClosed() {
		return 0, fmt.Errorf("conn write failed: conn already closed")
	}

	rAddr, err := c.remoteMa.ValueForProtocol(blema.P_BLE)
	if err != nil {
		return 0, err
	}

	// Write using native driver
	if bledrv.SendToDevice(rAddr, p) == false {
		return 0, fmt.Errorf("conn write failed: native write failed")
	}

	return len(p), nil
}

func (c *Conn) Close() error {
	if c.closed == false {
		rAddr, err := c.remoteMa.ValueForProtocol(blema.P_BLE)
		if err != nil {
			return err
		}

		logger().Debug("close native connection")
		bledrv.CloseConnWithDevice(rAddr)
	}

	c.closed = true
	return nil
}

func (c *Conn) LocalAddr() net.Addr {
	lAddr, _ := c.localMa.ValueForProtocol(blema.P_BLE)
	return &Addr{
		Address: lAddr,
	}
}

func (c *Conn) RemoteAddr() net.Addr {
	rAddr, _ := c.remoteMa.ValueForProtocol(blema.P_BLE)
	return &Addr{
		Address: rAddr,
	}
}

// Noop deadline methods
func (c *Conn) SetDeadline(t time.Time) error      { return nil }
func (c *Conn) SetReadDeadline(t time.Time) error  { return nil }
func (c *Conn) SetWriteDeadline(t time.Time) error { return nil }

// TODO: Refacto using updated version of libp2p
// Implement go-libp2p-transport CapableConn interface
// See https://github.com/libp2p/go-libp2p-core/blob/master/transport/transport.go
func (c *Conn) IsClosed() bool {
	return c.closed
}

func (c *Conn) OpenStream() (smu.Stream, error) {
	s, err := c.sess.OpenStream()
	if err != nil {
		logger().Error("conn OpenStream failed", zap.Error(err))
	}
	return s, err
}

func (c *Conn) AcceptStream() (smu.Stream, error) {
	s, err := c.sess.AcceptStream()
	if err != nil {
		logger().Error("conn AcceptStream failed", zap.Error(err))
	}
	return s, err
}

func (c *Conn) LocalPeer() peer.ID            { return c.localID }
func (c *Conn) LocalPrivateKey() ic.PrivKey   { return nil }
func (c *Conn) RemotePeer() peer.ID           { return c.remoteID }
func (c *Conn) RemotePublicKey() ic.PubKey    { return nil }
func (c *Conn) LocalMultiaddr() ma.Multiaddr  { return c.localMa }
func (c *Conn) RemoteMultiaddr() ma.Multiaddr { return c.remoteMa }
func (c *Conn) Transport() tpt.Transport      { return c.transport }
