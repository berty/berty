package ble

import (
	"C"
	"fmt"
	"time"

	ic "github.com/libp2p/go-libp2p-crypto"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	smu "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
)

type BLEConn struct {
	tpt.Conn
	opened         bool
	transport      *BLETransport
	lid            peer.ID
	rid            peer.ID
	lAddr          ma.Multiaddr
	rAddr          ma.Multiaddr
	incomingStream BLEStream
	outgoingStream BLEStream
	incomingOpen   chan struct{}
	outgoingOpen   chan struct{}
	accept         chan string
}

var conns map[string]*BLEConn = make(map[string]*BLEConn)

func NewConn(transport *BLETransport, lid, rid peer.ID, lAddr, rAddr ma.Multiaddr, dir int) BLEConn {
	conn := BLEConn{
		opened:       true,
		transport:    transport,
		lid:          lid,
		rid:          rid,
		lAddr:        lAddr,
		rAddr:        rAddr,
		incomingOpen: make(chan struct{}, 1),
		outgoingOpen: make(chan struct{}, 1),
	}
	fmt.Println("BLEConn new,")

	if dir == 1 {
		conn.incomingOpen <- struct{}{}
	} else {
		conn.outgoingOpen <- struct{}{}
	}
	st, _ := rAddr.ValueForProtocol(ma.P_RAW)
	conns[st] = &conn
	fmt.Println("BLEConn new fishish")
	return conn
}

func (b *BLEConn) LocalPeer() peer.ID {
	return b.lid
}

func (b *BLEConn) LocalPrivateKey() ic.PrivKey {
	return nil
}

func (b *BLEConn) RemotePeer() peer.ID {
	return b.rid
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
	fmt.Println("BLEConn Transport")
	time.Sleep(10 * time.Second)
	return b.transport
}

func (b *BLEConn) Close() error {
	fmt.Println("BLEConn Close")
	time.Sleep(10 * time.Second)
	return nil
}

func (b *BLEConn) IsClosed() bool {
	fmt.Println("BLEConn IsClosed")
	time.Sleep(10 * time.Second)
	return b.opened
}

// OpenStream creates a new stream.
func (b *BLEConn) OpenStream() (smu.Stream, error) {
	fmt.Println("Out Accept Stream")
	<-b.outgoingOpen
	fmt.Println("Out Accept S")
	return NewStream(b.rAddr), nil
}

// AcceptStream accepts a stream opened by the other side.
func (b *BLEConn) AcceptStream() (smu.Stream, error) {
	fmt.Println("Inc Accept Stream")
	<-b.incomingOpen
	fmt.Println("Inc Accept S")
	return NewStream(b.rAddr), nil
}
