package ble

import (
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
	opened    bool
	transport tpt.Transport
	lid       peer.ID
	rid       peer.ID
	lAddr     ma.Multiaddr
	rAddr     ma.Multiaddr
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
	fmt.Println("BLEConn OpenStream")
	time.Sleep(10 * time.Second)
	b.opened = true
	return &BLEStream{}, nil
}

// AcceptStream accepts a stream opened by the other side.
func (b *BLEConn) AcceptStream() (smu.Stream, error) {
	fmt.Println("BLEConn AcceptStream")
	time.Sleep(10 * time.Second)
	return &BLEStream{}, nil
}
