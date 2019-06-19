package ble

import (
	"fmt"
	"net"
	"sync"
	"time"

	ic "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	smu "github.com/libp2p/go-stream-muxer"
	yamux "github.com/libp2p/go-yamux"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

type Conn struct {
	tpt.Conn
	closed            bool
	closer            chan struct{}
	transport         *Transport
	lID               peer.ID
	rID               peer.ID
	lAddr             ma.Multiaddr
	rAddr             ma.Multiaddr
	notFinishedToRead []byte
	incoming          chan []byte
	sess              *yamux.Session
}

type ConnForSmux struct {
	*Conn
}

type localConn struct {
	*ConnForSmux
}

type remoteConn struct {
	*ConnForSmux
}

var conns sync.Map
var readers sync.Map

type reader struct {
	sync.Mutex
	funcSlice []func(*Conn)
}

func getConn(bleUUID string) (*Conn, bool) {
	c, ok := conns.Load(bleUUID)
	if !ok {
		return nil, ok
	}
	return c.(*Conn), ok
}

func loadOrCreate(bleUUID string) *reader {
	c, ok := readers.Load(bleUUID)
	if !ok {
		newReader := &reader{
			funcSlice: make([]func(*Conn), 0),
		}
		readers.Store(bleUUID, newReader)
		return newReader
	}
	return c.(*reader)
}

func makeFunc(tmp []byte) func(c *Conn) {
	return func(c *Conn) {
		c.incoming <- tmp
	}
}

func BytesToConn(bleUUID string, b []byte) {
	tmp := make([]byte, len(b))
	copy(tmp, b)
	r := loadOrCreate(bleUUID)
	r.funcSlice = append(r.funcSlice, makeFunc(tmp))
	go func(bleUUID string, r *reader) {
		r.Lock()
		defer r.Unlock()
		for {
			if conn, ok := getConn(bleUUID); ok {
				r.funcSlice[0](conn)
				r.funcSlice = r.funcSlice[1:]
				return
			}
		}
	}(bleUUID, r)
}

func ConnClosed(bleUUID string) {
	if conn, ok := getConn(bleUUID); ok {
		conns.Delete(bleUUID)
		conn.sess.Close()
	}
}

func NewConn(transport *Transport, lID, rID peer.ID, lAddr, rAddr ma.Multiaddr, dir int) Conn {
	conn := Conn{
		closed:            false,
		closer:            make(chan struct{}),
		transport:         transport,
		incoming:          make(chan []byte),
		lID:               lID,
		rID:               rID,
		lAddr:             lAddr,
		rAddr:             rAddr,
		notFinishedToRead: make([]byte, 0),
	}
	var err error
	connForSmux := ConnForSmux{
		&conn,
	}
	configDefault := yamux.DefaultConfig()
	// TODO: remove timout, it should be handled by the native write function
	configDefault.ConnectionWriteTimeout = 120 * time.Second
	configDefault.KeepAliveInterval = 240 * time.Second
	configDefault.LogOutput = getYamuxLogger()

	if dir == 1 {
		//server side
		conn.sess, err = yamux.Server(&connForSmux, configDefault)
	} else {
		// cli side
		conn.sess, err = yamux.Client(&connForSmux, configDefault)
	}
	if err != nil {
		panic(err)
	}

	st, _ := rAddr.ValueForProtocol(P_BLE)
	conns.Store(st, &conn)
	return conn
}

func (b *Conn) Read(p []byte) (n int, err error) {
	if b.notFinishedToRead != nil && len(b.notFinishedToRead) > 0 {
		// Read remaining data left in last call.
		copied := copy(p, b.notFinishedToRead)
		b.notFinishedToRead = b.notFinishedToRead[copied:]
		return copied, nil
	}

	select {
	case b.notFinishedToRead = <-b.incoming:
		copied := copy(p, b.notFinishedToRead)
		b.notFinishedToRead = b.notFinishedToRead[copied:]
		return copied, nil
	case <-b.closer:
		return 0, fmt.Errorf("conn closed")
	}
}

func (b *Conn) LocalPeer() peer.ID {
	return b.lID
}

func (b *Conn) LocalPrivateKey() ic.PrivKey {
	return nil
}

func (b *Conn) RemotePeer() peer.ID {
	return b.rID
}

func (b *Conn) RemotePublicKey() ic.PubKey {
	return nil
}

func (b *Conn) LocalMultiaddr() ma.Multiaddr {
	return b.lAddr
}

func (b *Conn) RemoteMultiaddr() ma.Multiaddr {
	return b.rAddr
}

func (b *Conn) Transport() tpt.Transport {
	logger().Debug("BLEConn Transport")
	return b.transport
}

func (b *ConnForSmux) LocalAddr() net.Addr {
	return &localConn{
		b,
	}
}

func (b *ConnForSmux) RemoteAddr() net.Addr {
	return &remoteConn{
		b,
	}
}

func (b *remoteConn) String() string {
	return b.rAddr.String()
}

func (b *localConn) String() string {
	return b.lAddr.String()
}

func (b *localConn) Network() string {
	return "ble"
}

func (b *remoteConn) Network() string {
	return "ble"
}

func (b *ConnForSmux) SetDeadline(t time.Time) error {
	return nil
}

func (b *ConnForSmux) SetReadDeadline(t time.Time) error {
	return nil
}

func (b *ConnForSmux) SetWriteDeadline(t time.Time) error {
	return nil
}

func (b *ConnForSmux) Close() error {
	logger().Debug("BLEConnForSmux Close")
	return nil
}

// OpenStream creates a new stream.
func (b *Conn) OpenStream() (smu.Stream, error) {
	s, err := b.sess.OpenStream()
	if err != nil {
		logger().Error("BLEConn OpenStream", zap.Error(err))
	}
	return s, err
}

// AcceptStream accepts a stream opened by the other side.
func (b *Conn) AcceptStream() (smu.Stream, error) {
	s, err := b.sess.AcceptStream()
	if err != nil {
		logger().Error("BLEConn AcceptStream", zap.Error(err))
	}
	return s, err
}
