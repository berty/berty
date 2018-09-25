package ble

import (
	"context"
	"fmt"
	"time"

	logging "github.com/ipfs/go-log"
	peer "github.com/libp2p/go-libp2p-peer"
	tpt "github.com/libp2p/go-libp2p-transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	rtpt "github.com/libp2p/go-reuseport-transport"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
	"github.com/satori/go.uuid"
	mafmt "github.com/whyrusleeping/mafmt"
)

// DefaultConnectTimeout is the (default) maximum amount of time the TCP
// transport will spend on the initial TCP connect before giving up.
var DefaultConnectTimeout = 5 * time.Second

var log = logging.Logger("ble-tpt")

// BLETransport is the TCP transport.
type BLETransport struct {
	// Connection upgrader for upgrading insecure stream connections to
	// secure multiplex connections.
	Upgrader *tptu.Upgrader

	// Explicitly disable reuseport.
	DisableReuseport bool

	// TCP connect timeout
	ConnectTimeout time.Duration

	reuse rtpt.Transport
}

var _ tpt.Transport = &BLETransport{}

// NewBLETransport creates a tcp transport object that tracks dialers and listeners
// created. It represents an entire tcp stack (though it might not necessarily be)
func NewBLETransport(upgrader *tptu.Upgrader) *BLETransport {
	fmt.Println("1")
	return &BLETransport{Upgrader: upgrader, ConnectTimeout: DefaultConnectTimeout}
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *BLETransport) CanDial(addr ma.Multiaddr) bool {
	return mafmt.BLE.Matches(addr)
}

func (t *BLETransport) maDial(ctx context.Context, raddr ma.Multiaddr) (manet.Conn, error) {
	fmt.Println("2")
	// Apply the deadline iff applicable
	if t.ConnectTimeout > 0 {
		deadline := time.Now().Add(t.ConnectTimeout)
		if d, ok := ctx.Deadline(); !ok || deadline.Before(d) {
			var cancel func()
			ctx, cancel = context.WithDeadline(ctx, deadline)
			defer cancel()
		}
	}

	if t.UseReuseport() {
		return t.reuse.DialContext(ctx, raddr)
	}
	var d manet.Dialer
	return d.DialContext(ctx, raddr)
}

// Dial dials the peer at the remote address.
func (t *BLETransport) Dial(ctx context.Context, raddr ma.Multiaddr, p peer.ID) (tpt.Conn, error) {
	fmt.Println("3")
	conn, err := t.maDial(ctx, raddr)
	if err != nil {
		return nil, err
	}
	return t.Upgrader.UpgradeOutbound(ctx, t, conn, p)
}

// UseReuseport returns true if reuseport is enabled and available.
func (t *BLETransport) UseReuseport() bool {
	fmt.Println("4")
	return false
}

func (t *BLETransport) maListen(laddr ma.Multiaddr) (manet.Listener, error) {
	fmt.Println("5")
	if t.UseReuseport() {
		return t.reuse.Listen(laddr)
	}
	return manet.Listen(laddr)
}

// Listen listens on the given multiaddr.
func (t *BLETransport) Listen(laddr ma.Multiaddr) (tpt.Listener, error) {
	fmt.Println("6")
	id, _ := uuid.NewV4()
	maaddr, _ := ma.NewMultiaddr(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d/ble/%s", 1280, id.String()))
	return &BLEListener{
		maAddr: maaddr,
	}, nil
}

// Protocols returns the list of terminal protocols this transport can dial.
func (t *BLETransport) Protocols() []int {
	fmt.Println("7")
	return []int{ma.P_RAW}
}

// Proxy always returns false for the TCP transport.
func (t *BLETransport) Proxy() bool {
	fmt.Println("8")
	return false
}

func (t *BLETransport) String() string {
	fmt.Println("9")
	return "BLE"
}
