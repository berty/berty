package ble

import (
	"context"
	"fmt"

	bledrv "berty.tech/core/network/protocol/ble/driver"
	blema "berty.tech/core/network/protocol/ble/multiaddr"

	"github.com/gofrs/uuid"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
)

const DefaultBind = "/ble/00000000-0000-0000-0000-000000000000"

// Transport is a BLE tpt.transport.
var _ tpt.Transport = &Transport{}

// Transport represents any device by which you can connect to and accept
// connections from other peers.
type Transport struct {
	host     host.Host
	listener *Listener // BLE transport can only have one listener.
	upgrader *tptu.Upgrader
}

// NewTransport creates a BLE transport object that tracks dialers and listener.
// It also starts the discovery service.
func NewTransport(h host.Host, u *tptu.Upgrader) *Transport {
	logger().Debug("NEWTRANSP CALLED")
	return &Transport{
		host:     h,
		upgrader: u,
	}
}

// Dial dials the peer at the remote address.
// With BLE you can only dial a device that is already connected with the native driver.
func (t *Transport) Dial(ctx context.Context, rMa ma.Multiaddr, rPID peer.ID) (tpt.CapableConn, error) {
	// BLE transport needs to have a running listener in order to dial other peer
	// because native driver is initialized during listener creation.
	logger().Debug("DIAL CALLED")
	if t.listener == nil {
		return nil, errors.New("transport dialing peer failed: no active listener")
	}

	rAddr, err := rMa.ValueForProtocol(blema.P_BLE)
	if err != nil {
		return nil, errors.Wrap(err, "transport dialing peer failed")
	}

	// Check if native driver is already connected to peer's device.
	// With BLE you can't really dial, only auto-connect with peer nearby.
	if bledrv.DialDevice(rAddr) == false {
		return nil, errors.New("transport dialing peer failed")
	}

	// Returns an outbound conn.
	logger().Debug("DIAL RETURN NEW CONN")
	return newConn(ctx, t, rMa, rPID, false)
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *Transport) CanDial(addr ma.Multiaddr) bool {
	logger().Debug("CAN DIAL CALLED")
	return blema.BLE.Matches(addr)
}

// Listen listens on the given multiaddr.
// BLE can't listen on more than one listener.
func (t *Transport) Listen(lMa ma.Multiaddr) (tpt.Listener, error) {
	// If a listener already exists, returns an error.
	logger().Debug("LISTEN CALLED WITH MA" + lMa.String())
	if t.listener != nil {
		return nil, errors.New("transport listen failed: one listener maximum")
	}

	// Checks if lMa is a valid multiaddr
	_, err := lMa.ValueForProtocol(blema.P_BLE)
	if err != nil {
		return nil, errors.Wrap(err, "transport listen failed: wrong multiaddr")
	}

	// Replaces default bind by a deterministic one based on local peerID.
	if lMa.String() == DefaultBind {
		lAddr := uuid.NewV5(uuid.UUID{}, t.host.ID().String()).String()
		lMa, err = ma.NewMultiaddr(fmt.Sprintf("/ble/%s", lAddr))
		if err != nil { // Should never append.
			panic(err)
		}
	}

	logger().Debug("LISTEN RETURN NEW LIST")
	// Creates then returns a new listener
	t.listener, err = newListener(lMa, t)

	return t.listener, err
}

// Proxy returns true if this transport proxies.
func (t *Transport) Proxy() bool {
	logger().Debug("PROXY CALLED")
	return false
}

// Protocols returns the set of protocols handled by this transport.
func (t *Transport) Protocols() []int {
	logger().Debug("PROTOCOLS CALLED")
	return []int{blema.P_BLE}
}

func (t *Transport) String() string {
	logger().Debug("STRING CALLED")
	return "BLE"
}
