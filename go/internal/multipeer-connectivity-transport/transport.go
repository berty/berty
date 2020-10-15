package mc

import (
	"context"
	"fmt"

	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
	mcma "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/multiaddr"
)

const DefaultBind = "/mc/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"

// logger is global because HandleFoundPeer must be able to call it
// FIXME: remove global logger
var logger *zap.Logger = zap.NewNop()

// Transport is a tpt.transport.
var _ tpt.Transport = &ProximityTransport{}

// ProximityTransport represents any device by which you can connect to and accept
// connections from other peers.
type ProximityTransport struct {
	host     host.Host
	upgrader *tptu.Upgrader

	ctx context.Context
}

func ProximityTransportConstructor(ctx context.Context, l *zap.Logger) func(h host.Host, u *tptu.Upgrader) (*ProximityTransport, error) {
	if l != nil {
		logger = l.Named("ProximityTransport")
	}
	return func(h host.Host, u *tptu.Upgrader) (*ProximityTransport, error) {
		logger.Debug("ProximityTransportConstructor()")
		return &ProximityTransport{
			host:     h,
			upgrader: u,
			ctx:      ctx,
		}, nil
	}
}

// Dial dials the peer at the remote address.
// With proximity connections (e.g. MC, BLE, Nearby) you can only dial a device that is already connected with the native driver.
func (t *ProximityTransport) Dial(ctx context.Context, remoteMa ma.Multiaddr, remotePID peer.ID) (tpt.CapableConn, error) {
	// ProximityTransport needs to have a running listener in order to dial other peer
	// because native driver is initialized during listener creation.
	gLock.RLock()
	defer gLock.RUnlock()
	if gListener == nil {
		return nil, errors.New("proximityTransport: ProximityTransport.Dial: no active listener")
	}

	// remoteAddr is supposed to be equal to remotePID since with proximity transports:
	// multiaddr = /<protocol>/<peerID>
	remoteAddr, err := remoteMa.ValueForProtocol(mcma.P_MC)
	if err != nil || remoteAddr != remotePID.Pretty() {
		return nil, errors.Wrap(err, "proximityTransport: ProximityTransport.Dial: wrong multiaddr")
	}

	// Check if native driver is already connected to peer's device.
	// With proximity connections you can't really dial, only auto-connect with peer nearby.
	if !mcdrv.DialPeer(remoteAddr) {
		return nil, errors.New("proximityTransport: ProximityTransport.Dial: peer not connected through the native driver")
	}

	// Can't have two connections on the same multiaddr
	if _, ok := connMap.Load(remoteAddr); ok {
		return nil, errors.New("proximityTransport: ProximityTransport.Dial: already connected to this address")
	}

	// Returns an outbound conn.
	return newConn(ctx, t, remoteMa, remotePID, false)
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *ProximityTransport) CanDial(remoteMa ma.Multiaddr) bool {
	return mcma.MC.Matches(remoteMa)
}

// Listen listens on the given multiaddr.
// Proximity connections can't listen on more than one listener.
func (t *ProximityTransport) Listen(localMa ma.Multiaddr) (tpt.Listener, error) {
	// localAddr is supposed to be equal to the localPID
	// or to DefaultBind since multiaddr == /<protocol>/<peerID>
	localPID := t.host.ID().Pretty()
	localAddr, err := localMa.ValueForProtocol(mcma.P_MC)
	if err != nil || (localMa.String() != DefaultBind && localAddr != localPID) {
		return nil, errors.Wrap(err, "proximityTransport: ProximityTransport.Listen: wrong multiaddr")
	}

	// Replaces default bind by local host peerID
	if localMa.String() == DefaultBind {
		localMa, err = ma.NewMultiaddr(fmt.Sprintf("/mc/%s", localPID))
		if err != nil { // Should never append.
			panic(err)
		}
	}

	// If a global listener already exists, returns an error.
	gLock.RLock()
	if gListener != nil {
		gLock.RUnlock()
		return nil, errors.New("proximityTransport: ProximityTransport.Listen: one listener maximum")
	}
	gLock.RUnlock()

	return newListener(t.ctx, localMa, t), nil
}

// Proxy returns true if this transport proxies.
func (t *ProximityTransport) Proxy() bool {
	return false
}

// Protocols returns the set of protocols handled by this transport.
func (t *ProximityTransport) Protocols() []int {
	return []int{mcma.P_MC}
}

func (t *ProximityTransport) String() string {
	return "MC"
}
