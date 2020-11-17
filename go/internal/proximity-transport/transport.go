package proximitytransport

import (
	"context"
	"fmt"
	"sync"

	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/multiformats/go-multiaddr-fmt"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// proximityTransport is a tpt.transport.
var _ tpt.Transport = &proximityTransport{}

// proximityTransport is a ProximityTransport.
var _ ProximityTransport = &proximityTransport{}

// TransportMap keeps tracks of existing Transport to prevent multiple utilizations
var TransportMap sync.Map

type ProximityTransport interface {
	HandleFoundPeer(remotePID string) bool
	HandleLostPeer(remotePID string)
	ReceiveFromPeer(remotePID string, payload []byte)
}

// proximityTransport represents any device by which you can connect to and accept
// connections from other peers.
type proximityTransport struct {
	host     host.Host
	upgrader *tptu.Upgrader

	connMap  sync.Map
	lock     sync.RWMutex
	listener *Listener
	driver   NativeDriver
	logger   *zap.Logger
	ctx      context.Context
}

func NewTransport(ctx context.Context, l *zap.Logger, driver NativeDriver) func(h host.Host, u *tptu.Upgrader) (*proximityTransport, error) {
	l = l.Named("ProximityTransport")

	if driver == nil {
		l.Error("error: NewTransport: driver is nil")
		driver = &NoopNativeDriver{}
	}

	return func(h host.Host, u *tptu.Upgrader) (*proximityTransport, error) {
		l.Debug("NewTransport()")
		transport := &proximityTransport{
			host:     h,
			upgrader: u,
			driver:   driver,
			logger:   l,
			ctx:      ctx,
		}

		return transport, nil
	}
}

// Dial dials the peer at the remote address.
// With proximity connections (e.g. MC, BLE, Nearby) you can only dial a device that is already connected with the native driver.
func (t *proximityTransport) Dial(ctx context.Context, remoteMa ma.Multiaddr, remotePID peer.ID) (tpt.CapableConn, error) {
	// proximityTransport needs to have a running listener in order to dial other peer
	// because native driver is initialized during listener creation.
	t.lock.RLock()
	defer t.lock.RUnlock()
	if t.listener == nil {
		return nil, errors.New("error: proximityTransport.Dial: no active listener")
	}

	// remoteAddr is supposed to be equal to remotePID since with proximity transports:
	// multiaddr = /<protocol>/<peerID>
	remoteAddr, err := remoteMa.ValueForProtocol(t.driver.ProtocolCode())
	if err != nil || remoteAddr != remotePID.Pretty() {
		return nil, errors.Wrap(err, "error: proximityTransport.Dial: wrong multiaddr")
	}

	// Check if native driver is already connected to peer's device.
	// With proximity connections you can't really dial, only auto-connect with peer nearby.
	if !t.driver.DialPeer(remoteAddr) {
		return nil, errors.New("error: proximityTransport.Dial: peer not connected through the native driver")
	}

	// Can't have two connections on the same multiaddr
	if _, ok := t.connMap.Load(remoteAddr); ok {
		return nil, errors.New("error: proximityTransport.Dial: already connected to this address")
	}

	// Returns an outbound conn.
	return newConn(ctx, t, remoteMa, remotePID, false)
}

// CanDial returns true if this transport believes it can dial the given
// multiaddr.
func (t *proximityTransport) CanDial(remoteMa ma.Multiaddr) bool {
	// multiaddr validation checker
	return mafmt.Base(t.driver.ProtocolCode()).Matches(remoteMa)
}

// Listen listens on the given multiaddr.
// Proximity connections can't listen on more than one listener.
func (t *proximityTransport) Listen(localMa ma.Multiaddr) (tpt.Listener, error) {
	// localAddr is supposed to be equal to the localPID
	// or to DefaultAddr since multiaddr == /<protocol>/<peerID>
	localPID := t.host.ID().Pretty()
	localAddr, err := localMa.ValueForProtocol(t.driver.ProtocolCode())
	if err != nil || (localMa.String() != t.driver.DefaultAddr() && localAddr != localPID) {
		return nil, errors.Wrap(err, "error: proximityTransport.Listen: wrong multiaddr")
	}

	// Replaces default bind by local host peerID
	if localMa.String() == t.driver.DefaultAddr() {
		localMa, err = ma.NewMultiaddr(fmt.Sprintf("/%s/%s", t.driver.ProtocolName(), localPID))
		if err != nil { // Should never append.
			panic(err)
		}
	}

	t.lock.RLock()
	// If the a listener already exists for this driver, returns an error.
	_, ok := TransportMap.Load(t.driver.ProtocolName())
	if ok || t.listener != nil {
		t.lock.RUnlock()
		return nil, errors.New("error: proximityTransport.Listen: one listener maximum")
	}
	t.lock.RUnlock()

	// Register this transport
	TransportMap.Store(t.driver.ProtocolName(), t)

	t.lock.Lock()
	defer t.lock.Unlock()

	t.listener = newListener(t.ctx, localMa, t)

	return t.listener, err
}

// Proxy returns true if this transport proxies.
func (t *proximityTransport) Proxy() bool {
	return false
}

// Protocols returns the set of protocols handled by this transport.
func (t *proximityTransport) Protocols() []int {
	return []int{t.driver.ProtocolCode()}
}

func (t *proximityTransport) String() string {
	return t.driver.ProtocolName()
}
