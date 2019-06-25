package ble

import (
	"context"
	"fmt"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	blema "berty.tech/core/network/protocol/ble/multiaddr"
	"github.com/gofrs/uuid"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
)

const DefaultBind = "/ble/00000000-0000-0000-0000-000000000000"

// Transport is the BLE transport
type Transport struct {
	host     host.Host
	listener *Listener // BLE transport can only have one listener
}

var _ tpt.Transport = &Transport{}

// NewTransport creates a BLE transport object that tracks dialers and listener
func NewTransport(h host.Host) *Transport {
	return &Transport{
		host: h,
	}
}

// Dial dials the peer at the remote address.
func (t *Transport) Dial(ctx context.Context, rMa ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	// BLE transport needs to have a running listener in order to Dial other peer
	// Native drivers are initialized during listener creation
	if t.listener == nil {
		return nil, errors.New("transport dialing peer failed: no active listener")
	}

	rAddr, err := rMa.ValueForProtocol(blema.P_BLE)
	if err != nil {
		return nil, errors.Wrap(err, "transport dialing peer failed")
	}

	// TODO: Is this pertinent? We need to think about it
	if bledrv.DialDevice(rAddr) == false {
		return nil, errors.New("transport dialing peer failed")
	}

	var conn *Conn
	// Check if a conn already exists
	if conn = getConn(rAddr); conn != nil {
		conn.closed = false
		conn.closer = make(chan struct{})
	} else {
		// TODO: Is this pertinent? Or should it be better to return an error?
		conn = newConn(t, t.host.ID(), p, t.listener.localMa, rMa, client)
	}

	return conn, nil
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *Transport) CanDial(addr ma.Multiaddr) bool {
	return blema.BLE.Matches(addr)
}

// Listen listens on the given multiaddr.
// BLE can't listen on more than one listener
func (t *Transport) Listen(lMa ma.Multiaddr) (tpt.Listener, error) {
	var lAddr string
	var err error

	// Replace default bind by a deterministic one based on local peerID
	if lMa.String() == DefaultBind {
		lAddr = uuid.NewV5(uuid.UUID{}, t.host.ID().String()).String()
		lMa, err = ma.NewMultiaddr(fmt.Sprintf("/ble/%s", lAddr))
		if err != nil { // Should never append
			panic(err)
		}
	} else {
		lAddr, err = lMa.ValueForProtocol(blema.P_BLE)
		if err != nil {
			return nil, errors.New("transport listen failed: wrong multiaddr")
		}
	}

	// If a listener already exists
	if t.listener != nil {
		// If the addr is the same as the current one, return the current listener
		if t.listener.Addr().String() == lAddr {
			return t.listener, nil
		}
		// If the addr is different, return an error
		return nil, errors.New("transport listen failed: one listener maximum")
	}

	// Otherwise, create a new listener and return it
	t.listener, err = newListener(lMa, t)
	if err == nil {
		startDiscovery(t) // Start discovery service
	}

	return t.listener, err
}

// Proxy returns true if this transport proxies.
func (t *Transport) Proxy() bool {
	return false
}

// Protocols returns the set of protocols handled by this transport.
func (t *Transport) Protocols() []int {
	return []int{blema.P_BLE}
}

func (t *Transport) String() string {
	return "BLE"
}
