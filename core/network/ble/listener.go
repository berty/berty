package ble

import (
	"fmt"
	"net"

	// "runtime/debug"

	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// Listener implement ipfs Listener interface
type Listener struct {
	tpt.Listener
	transport       *Transport
	addr            string
	network         string
	incomingBLEUUID chan string
	incomingPeerID  chan string
	closer          chan struct{}
	lAddr           ma.Multiaddr
}

var listeners = make(map[string]*Listener)

func RealAcceptSender(peerID string, ble string, incPeerID string) {
	for {
		logger().Debug("ACCEPT\n", zap.String("peer", peerID))
		if listener, ok := listeners[peerID]; ok {
			listener.incomingBLEUUID <- ble
			listener.incomingPeerID <- incPeerID
			return
		}
	}
}

func (b *Listener) Addr() net.Addr {
	m, _ := b.lAddr.ValueForProtocol(PBle)
	return &Addr{
		Address: m,
	}
}

func (b *Listener) Multiaddr() ma.Multiaddr {
	logger().Debug("BLEListener Multiaddr")
	return b.lAddr
}

func (b *Listener) Accept() (tpt.Conn, error) {
	for {
		select {
		case _, ok := <-b.closer:
			if !ok {
				return nil, fmt.Errorf("ble listener closed")
			}
		case bleUUID, _ := <-b.incomingBLEUUID:
			peerIDb58 := <-b.incomingPeerID
			for {
				ci, ok := getConn(bleUUID)
				if !ok {
					rAddr, err := ma.NewMultiaddr("/ble/" + bleUUID)
					if err != nil {
						return nil, err
					}
					rID, err := peer.IDB58Decode(peerIDb58)
					if err != nil {
						return nil, err
					}
					c := NewConn(b.transport, b.transport.MySelf.ID(), rID, b.lAddr, rAddr, 1)
					return &c, nil
				}
				return ci, nil
			}
		}
	}
}

// Close TODO: stop advertising release object etc...
func (b *Listener) Close() error {
	logger().Debug("BLEListener Close")
	select {
	case _, ok := <-b.closer:
		if !ok {
			return fmt.Errorf("ble listerner already closed")
		}
	default:
		b.closeNative()
		close(b.closer)
	}
	return nil
}
