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

/*
#cgo darwin CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo darwin LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
*/
import "C"

type Conn struct {
	tpt.Conn
	opened            bool
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

var conns map[string]*Conn = make(map[string]*Conn)

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

func NewConn(transport *Transport, lID, rID peer.ID, lAddr, rAddr ma.Multiaddr, dir int) Conn {
	conn := Conn{
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

func (b *Conn) Write(p []byte) (n int, err error) {
	val, err := b.rAddr.ValueForProtocol(PBle)
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

func (b *Conn) Close() error {
	logger().Debug("BLEConn Close")
	time.Sleep(10 * time.Second)
	return nil
}

func (b *Conn) IsClosed() bool {
	logger().Debug("BLEConn IsClosed")
	return b.sess.IsClosed()
}

// OpenStream creates a new stream.
func (b *Conn) OpenStream() (smu.Stream, error) {
	return b.sess.OpenStream()
}

// AcceptStream accepts a stream opened by the other side.
func (b *Conn) AcceptStream() (smu.Stream, error) {
	return b.sess.AcceptStream()
}
