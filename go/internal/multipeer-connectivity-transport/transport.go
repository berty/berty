package mc

import (
	"context"
	"fmt"

	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
	mcma "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/multiaddr"

	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

const DefaultBind = "/mc/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

// logger is global because HandleFoundPeer must be able to call it
// FIXME: remove global logger
var logger *zap.Logger = zap.L().Named("mc-transport")

// Transport is a tpt.transport.
var _ tpt.Transport = &Transport{}

// Transport represents any device by which you can connect to and accept
// connections from other peers.
type Transport struct {
	host     host.Host
	upgrader *tptu.Upgrader
}

func NewTransportConstructorWithLogger(l *zap.Logger) func(h host.Host, u *tptu.Upgrader) (*Transport, error) {
	if l != nil {
		logger = l
	}
	return NewTransport
}

// NewTransport creates a transport object that tracks dialers and listener.
// It also starts the discovery service.
func NewTransport(h host.Host, u *tptu.Upgrader) (*Transport, error) {
	return &Transport{
		host:     h,
		upgrader: u,
	}, nil
}

// Dial dials the peer at the remote address.
// With MC you can only dial a device that is already connected with the native driver.
func (t *Transport) Dial(ctx context.Context, remoteMa ma.Multiaddr, remotePID peer.ID) (tpt.CapableConn, error) {
	// MC transport needs to have a running listener in order to dial other peer
	// because native driver is initialized during listener creation.
	if gListener == nil {
		return nil, errors.New("transport dialing peer failed: no active listener")
	}

	// remoteAddr is supposed to be equal to remotePID since with MC transport:
	// multiaddr = /mc/<peerID>
	remoteAddr, err := remoteMa.ValueForProtocol(mcma.P_MC)
	if err != nil || remoteAddr != remotePID.Pretty() {
		return nil, errors.Wrap(err, "transport dialing peer failed: wrong multiaddr")
	}

	// Check if native driver is already connected to peer's device.
	// With MC you can't really dial, only auto-connect with peer nearby.
	if !mcdrv.DialPeer(remoteAddr) {
		return nil, errors.New("transport dialing peer failed: peer not connected through MC")
	}

	// Can't have two connections on the same multiaddr
	if _, ok := connMap.Load(remoteAddr); ok {
		return nil, errors.New("transport dialing peer failed: already connected to this address")
	}

	// Returns an outbound conn.
	return newConn(ctx, t, remoteMa, remotePID, false)
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *Transport) CanDial(remoteMa ma.Multiaddr) bool {
	return mcma.MC.Matches(remoteMa)
}

// Listen listens on the given multiaddr.
// MC can't listen on more than one listener.
func (t *Transport) Listen(localMa ma.Multiaddr) (tpt.Listener, error) {
	// localAddr is supposed to be equal to the localPID
	// or to DefaultBind since multiaddr == /mc/<peerID>
	localPID := t.host.ID().Pretty()
	localAddr, err := localMa.ValueForProtocol(mcma.P_MC)
	if err != nil || (localMa.String() != DefaultBind && localAddr != localPID) {
		return nil, errors.Wrap(err, "transport listen failed: wrong multiaddr")
	}

	// Replaces default bind by local host peerID
	if localMa.String() == DefaultBind {
		localMa, err = ma.NewMultiaddr(fmt.Sprintf("/mc/%s", localPID))
		if err != nil { // Should never append.
			panic(err)
		}
	}

	// If a global listener already exists, returns an error.
	if gListener != nil {
		// TODO: restore this when published as generic lib / fixed in Berty network
		// config update
		// return nil, errors.New("transport listen failed: one listener maximum")
		gListener.Close()
	}

	return newListener(localMa, t), nil
}

// Proxy returns true if this transport proxies.
func (t *Transport) Proxy() bool {
	return false
}

// Protocols returns the set of protocols handled by this transport.
func (t *Transport) Protocols() []int {
	return []int{mcma.P_MC}
}

func (t *Transport) String() string {
	return "MC"
}
