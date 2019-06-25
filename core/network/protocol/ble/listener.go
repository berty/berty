package ble

import (
	"errors"
	"net"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	blema "berty.tech/core/network/protocol/ble/multiaddr"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
)

// Listener implement lip2p Listener interface
type Listener struct {
	tpt.Listener
	transport       *Transport
	localMa         ma.Multiaddr
	incomingConnReq chan connReq
	closer          chan struct{}
}

type connReq struct {
	remoteAddr   string
	remoteMa     ma.Multiaddr
	remotePeerID peer.ID
}

func newListener(lMa ma.Multiaddr, t *Transport) (*Listener, error) {
	listener := &Listener{
		transport:       t,
		localMa:         lMa,
		incomingConnReq: make(chan connReq),
		closer:          make(chan struct{}),
	}

	if !bledrv.StartBleDriver(listener.Addr().String(), t.host.ID().Pretty()) {
		return nil, errors.New("listener creation failed: can't start BLE native driver")
	}

	return listener, nil
}

func (l *Listener) Addr() net.Addr {
	lAddr, _ := l.localMa.ValueForProtocol(blema.P_BLE)
	return &Addr{
		Address: lAddr,
	}
}

func (l *Listener) Multiaddr() ma.Multiaddr {
	return l.localMa
}

func (l *Listener) Accept() (tpt.Conn, error) {
	select {
	case <-l.closer:
		return nil, errors.New("listener accept failed: listener already closed")
	case req := <-l.incomingConnReq:
		if conn := getConn(req.remoteAddr); conn != nil {
			return conn, nil
		}
		return newConn(
			l.transport,
			l.transport.host.ID(),
			req.remotePeerID,
			l.localMa,
			req.remoteMa,
			server), nil
	}
}

func (l *Listener) Close() error {
	select {
	case <-l.closer:
		return errors.New("listener close failed: already closed")
	default:
		defer close(l.closer)
		if !bledrv.StopBleDriver() {
			return errors.New("listener close failed: can't stop BLE native driver")
		}
		return nil
	}
}
