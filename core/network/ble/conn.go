// +build darwin

package ble

import (
	"C"
	"time"
	"unsafe"

	ic "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	smu "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
	yamux "github.com/whyrusleeping/yamux"
)

var conns map[string]*BLEConn = make(map[string]*BLEConn)

//export sendBytesToConn
func sendBytesToConn(bleUUID *C.char, bytes unsafe.Pointer, length C.int) {
	goBleUUID := C.GoString(bleUUID)
	b := C.GoBytes(bytes, length)
	go func(goBleUUID string, b []byte) {
		for {
			if conn, ok := conns[goBleUUID]; ok {
				conn.incoming <- b
				return
			}
			time.Sleep(1 * time.Second)
		}
	}(goBleUUID, b)
}

func NewConn(transport *BLETransport, lID, rID peer.ID, lAddr, rAddr ma.Multiaddr, dir int) BLEConn {
	conn := BLEConn{
		opened:            true,
		transport:         transport,
		incoming:          make(chan []byte),
		lID:               lID,
		rID:               rID,
		lAddr:             lAddr,
		rAddr:             rAddr,
		notFinishedToRead: make([]byte, 0),
	}
	var err error

	if dir == 1 {
		//server side
		conn.sess, err = yamux.Server(&conn, yamux.DefaultConfig())
	} else {
		// cli side
		conn.sess, err = yamux.Client(&conn, yamux.DefaultConfig())
	}
	if err != nil {
		panic(err)
	}

	st, _ := rAddr.ValueForProtocol(P_BLE)
	conns[st] = &conn
	return conn
}

func (b *BLEConn) Read(p []byte) (n int, err error) {
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

func (b *BLEConn) Write(p []byte) (n int, err error) {
	val, err := b.rAddr.ValueForProtocol(P_BLE)
	if err != nil {
		return 0, err
	}

	ma := C.CString(val)
	defer C.free(unsafe.Pointer(ma))
	C.writeNSData(
		C.Bytes2NSData(
			unsafe.Pointer(&p[0]),
			C.int(len(p)),
		),
		ma,
	)

	return len(p), nil
}

func (b *BLEConn) LocalPeer() peer.ID {
	return b.lID
}

func (b *BLEConn) LocalPrivateKey() ic.PrivKey {
	return nil
}

func (b *BLEConn) RemotePeer() peer.ID {
	return b.rID
}

func (b *BLEConn) RemotePublicKey() ic.PubKey {
	return nil
}

func (b *BLEConn) LocalMultiaddr() ma.Multiaddr {
	return b.lAddr
}

func (b *BLEConn) RemoteMultiaddr() ma.Multiaddr {
	return b.rAddr
}

func (b *BLEConn) Transport() tpt.Transport {
	logger().Debug("BLEConn Transport")
	return b.transport
}

func (b *BLEConn) Close() error {
	logger().Debug("BLEConn Close")
	time.Sleep(10 * time.Second)
	return nil
}

func (b *BLEConn) IsClosed() bool {
	logger().Debug("BLEConn IsClosed")
	return b.sess.IsClosed()
}

// OpenStream creates a new stream.
func (b *BLEConn) OpenStream() (smu.Stream, error) {
	return b.sess.OpenStream()
}

// AcceptStream accepts a stream opened by the other side.
func (b *BLEConn) AcceptStream() (smu.Stream, error) {
	return b.sess.AcceptStream()
}
