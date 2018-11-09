// +build android darwin

package ble

import (
	ic "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	smu "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
	yamux "github.com/whyrusleeping/yamux"
	"go.uber.org/zap"
)

type Conn struct {
	tpt.Conn
	closed            bool
	transport         *Transport
	lID               peer.ID
	rID               peer.ID
	lAddr             ma.Multiaddr
	rAddr             ma.Multiaddr
	notFinishedToRead []byte
	incoming          chan []byte
	sess              *yamux.Session
	accept            chan string
}

type ConnForSmux struct {
	*Conn
}

var conns map[string]*Conn = make(map[string]*Conn)

func BytesToConn(bleUUID string, b []byte) {
	tmp := make([]byte, len(b))
	copy(tmp, b)
	go func(bleUUID string, tmp []byte) {
		for {
			if conn, ok := conns[bleUUID]; ok {
				conn.incoming <- tmp
				return
			}
		}
	}(bleUUID, tmp)
}

func ConnClosed(bleUUID string) {
	if conn, ok := conns[bleUUID]; ok {
		delete(conns, bleUUID)
		conn.closed = true
		conn.sess.Close()
	}
}

func ConnClose(bleUUID string) {
	if conn, ok := conns[bleUUID]; ok {
		delete(conns, bleUUID)
		conn.sess.Close()
	}
}

func NewConn(transport *Transport, lID, rID peer.ID, lAddr, rAddr ma.Multiaddr, dir int) Conn {
	conn := Conn{
		closed:            false,
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
	// configDefault.ConnectionWriteTimeout = 120 * time.Second
	// configDefault.KeepAliveInterval = 240 * time.Second

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

	st, _ := rAddr.ValueForProtocol(PBle)
	conns[st] = &conn
	return conn
}

func (b *Conn) Read(p []byte) (n int, err error) {
	if b.notFinishedToRead != nil && len(b.notFinishedToRead) > 0 {
		// Read remaining data left in last call.
		copied := copy(p, b.notFinishedToRead)
		b.notFinishedToRead = b.notFinishedToRead[copied:]
		return copied, nil
	}

	b.notFinishedToRead = <-b.incoming
	copied := copy(p, b.notFinishedToRead)
	b.notFinishedToRead = b.notFinishedToRead[copied:]
	return copied, nil
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
