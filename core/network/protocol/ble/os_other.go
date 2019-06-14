// +build !darwin,!android

package ble

import (
	"context"
	"time"

	"berty.tech/core/pkg/errorcodes"
	host "github.com/libp2p/go-libp2p-host"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	rtpt "github.com/libp2p/go-reuseport-transport"
	ma "github.com/multiformats/go-multiaddr"
)

// BLETransport is the TCP transport.
type Transport struct {
	Host host.Host
	// Explicitly disable reuseport.
	DisableReuseport bool
	// ID
	ID    string
	lAddr ma.Multiaddr
	// TCP connect timeout
	ConnectTimeout time.Duration
	reuse          rtpt.Transport
}

func NewTransport(me host.Host) (*Transport, error) {
	return nil, errorcodes.ErrUnimplemented.New()
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *Transport) CanDial(addr ma.Multiaddr) bool {
	return false
}

// Dial dials the   peer at the remote address.
func (t *Transport) Dial(ctx context.Context, rAddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	return nil, errorcodes.ErrUnimplemented.New()
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *Transport) UseReuseport() bool {
	return false
}

// Listen listens on the given multiaddr.
func (t *Transport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	return nil, errorcodes.ErrUnimplemented.New()
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *Transport) Protocols() []int {
	return []int{P_BLE}
}

// Proxy always returns false for the TCP transport.
func (t *Transport) Proxy() bool {
	return false
}

func (t *Transport) String() string {
	return "ble"
}

func (b *Listener) closeNative() {
	/** intentionally empty */
}

func (b *Conn) Write(p []byte) (n int, err error) {
	return 0, errorcodes.ErrUnimplemented.New()
}
