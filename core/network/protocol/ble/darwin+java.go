// +build android darwin

package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
)

func (t *Transport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	s, err := rAddr.ValueForProtocol(P_BLE)
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
	c := NewConn(t, t.Host.ID(), p, t.lAddr, rAddr, 0)
	return &c, nil
}

func (b *Conn) Close() error {
	logger().Debug("BLEConn Close")
	if b.closed == false {
		val, err := b.rAddr.ValueForProtocol(P_BLE)
		if err != nil {
			return err
		}
		CloseConnFromMa(val)
	}
	b.closed = true
	return nil
}

func (b *Conn) Write(p []byte) (n int, err error) {
	if b.IsClosed() {
		return 0, fmt.Errorf("conn already closed")
	}
	val, err := b.rAddr.ValueForProtocol(P_BLE)
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

func (b *Conn) IsClosed() bool { return b.closed }

func (b *Listener) closeNative() {
	CloseScannerAndAdvertiser()
}
