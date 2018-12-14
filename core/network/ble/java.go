// +build android

package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
)

var SetMa func(string) = nil
var SetPeerID func(string) = nil
var StartScanning func() = nil
var StartAdvertising func() = nil
var Write func(p []byte, ma string) bool = nil
var DialPeer func(ma string) bool = nil
var InitScannerAndAdvertiser func() = nil
var CloseScannerAndAdvertiser func() = nil
var CloseConnFromMa func(ma string) = nil

func (t *Transport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	// if int(C.isDiscovering()) != 1 {
	// 	go C.startDiscover()
	// }
	s, err := rAddr.ValueForProtocol(PBle)
	if err != nil {
		return nil, err
	}

	if DialPeer(s) == false {
		return nil, fmt.Errorf("error dialing ble")
	}

	if conn, ok := getConn(s); ok {
		conn.closed = false
		conn.closer = make(chan struct{})
		return conn, nil
	}
	c := NewConn(t, t.MySelf.ID(), p, t.lAddr, rAddr, 0)
	return &c, nil
}

func (b *Conn) Close() error {
	logger().Debug("BLEConn Close")
	if b.closed == false {
		val, err := b.rAddr.ValueForProtocol(PBle)
		if err != nil {
			return err
		}
		CloseConnFromMa(val)
	}
	b.closed = true
	// val, err := b.rAddr.ValueForProtocol(PBle)
	// if err != nil {
	// 	logger().Debug("BLEConn close", zap.Error(err))
	// 	return err
	// }
	// ma := C.CString(val)
	// defer C.free(unsafe.Pointer(ma))
	// C.closeConn(ma)
	return nil
}

func (b *Conn) Write(p []byte) (n int, err error) {
	if b.IsClosed() {
		return 0, fmt.Errorf("conn already closed")
	}
	val, err := b.rAddr.ValueForProtocol(PBle)
	if err != nil {
		return 0, err
	}
	if Write(p, val) == false {
		return 0, fmt.Errorf("Error writing check java")
	}

	return len(p), nil
}

func NewListener(lAddr ma.Multiaddr, hostID peer.ID, t *Transport) (*Listener, error) {
	InitScannerAndAdvertiser()
	StartScanning()
	StartAdvertising()

	listener := &Listener{
		lAddr:           lAddr,
		incomingBLEUUID: make(chan string),
		incomingPeerID:  make(chan string),
		transport:       t,
		closer:          make(chan struct{}),
	}

	listeners[t.ID] = listener
	return listener, nil
}

func (b *Conn) IsClosed() bool {
	// val, err := b.rAddr.ValueForProtocol(PBle)
	// if err != nil {
	// 	logger().Debug("BLEConn IsClosed", zap.Error(err))
	// 	return true
	// }
	// ma := C.CString(val)
	// defer C.free(unsafe.Pointer(ma))

	return b.closed
}

func (b *Listener) closeNative() {
	CloseScannerAndAdvertiser()
}
