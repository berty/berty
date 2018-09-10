// +build !darwin

package ble

import (
	"C"
	"context"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
)

var ErrNotImplemented = errors.New("not implemented yet")

func NewBLETransport(ID string, lAddr ma.Multiaddr) func(me host.Host) (*BLETransport, error) {
	return func(me host.Host) (*BLETransport, error) {
		return nil, errors.Wrap(ErrNotImplemented, "NewTransport")
	}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *BLETransport) CanDial(addr ma.Multiaddr) bool {
	return false
}

// Dial dials the   peer at the remote address.
func (t *BLETransport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	return nil, errors.Wrap(ErrNotImplemented, "Dial")
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *BLETransport) UseReuseport() bool {
	return false
}

// Listen listens on the given multiaddr.
func (t *BLETransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	return nil, errors.Wrap(ErrNotImplemented, "Listen")
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *BLETransport) Protocols() []int {
	return []int{P_BLE}
}

// Proxy always returns false for the TCP transport.
func (t *BLETransport) Proxy() bool {
	return false
}

func (t *BLETransport) String() string {
	return "ble"
}
