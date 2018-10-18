// +build !darwin

package ble

import "C"
import (
	"context"

	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
)

type Transport struct {
}

var ErrNotImplemented = errors.New("not implemented yet")

func NewBLETransport(ID string, lAddr ma.Multiaddr) (func(me host.Host) *Transport, error) {
	return nil, errors.Wrap(ErrNotImplemented, "NewTransport")
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *Transport) CanDial(addr ma.Multiaddr) bool {
	return false
}

// Dial dials the   peer at the remote address.
func (t *Transport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	return nil, errors.Wrap(ErrNotImplemented, "Dial")
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *Transport) UseReuseport() bool {
	return false
}

// Listen listens on the given multiaddr.
func (t *Transport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	return nil, errors.Wrap(ErrNotImplemented, "Listen")
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *Transport) Protocols() []int {
	return []int{PBle}
}

// Proxy always returns false for the TCP transport.
func (t *Transport) Proxy() bool {
	return false
}

func (t *Transport) String() string {
	return "ble"
}
