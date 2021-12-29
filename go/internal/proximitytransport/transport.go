package proximitytransport

import (
	"context"
	"fmt"
	"sync"

	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	pstore "github.com/libp2p/go-libp2p-core/peerstore"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/multiformats/go-multiaddr-fmt"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

// The ProximityTransport is a libp2p transport that initializes NativeDriver.
// It allows connecting to nearby peers

// proximityTransport is a tpt.transport.
var _ tpt.Transport = &proximityTransport{}

// proximityTransport is a ProximityTransport.
var _ ProximityTransport = &proximityTransport{}

// TransportMap prevents instantiating multiple Transport
var TransportMap = make(map[string]*proximityTransport)

// TransportMapMutex is the mutex for the TransportMap var
var TransportMapMutex sync.RWMutex

// Define log level for driver loggers
const (
	Verbose = iota
	Debug
	Info
	Warn
	Error
)

type ProximityTransport interface {
	HandleFoundPeer(remotePID string) bool
	HandleLostPeer(remotePID string)
	ReceiveFromPeer(remotePID string, payload []byte)
	Log(level int, message string)
}

type proximityTransport struct {
	host     host.Host
	upgrader *tptu.Upgrader

	connMap      map[string]*Conn
	connMapMutex sync.RWMutex
	cache        *RingBufferMap
	lock         sync.RWMutex
	listener     *Listener
	driver       ProximityDriver
	logger       *zap.Logger
	ctx          context.Context
}

func NewTransport(ctx context.Context, l *zap.Logger, driver ProximityDriver) func(h host.Host, u *tptu.Upgrader) (*proximityTransport, error) {
	if l == nil {
		l = zap.NewNop()
	}

	l = l.Named("ProximityTransport")

	if driver == nil {
		l.Error("error: NewTransport: driver is nil")
		driver = &NoopProximityDriver{}
	}

	return func(h host.Host, u *tptu.Upgrader) (*proximityTransport, error) {
		l.Debug("NewTransport called", zap.String("driver", driver.ProtocolName()))
		transport := &proximityTransport{
			host:     h,
			upgrader: u,
			connMap:  make(map[string]*Conn),
			cache:    NewRingBufferMap(l, 128),
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
	t.connMapMutex.RLock()
	_, ok := t.connMap[remoteAddr]
	t.connMapMutex.RUnlock()
	if ok {
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

	// If the a listener already exists for this driver, returns an error.
	TransportMapMutex.RLock()
	_, ok := TransportMap[t.driver.ProtocolName()]
	TransportMapMutex.RUnlock()
	t.lock.RLock()
	if ok || t.listener != nil {
		t.lock.RUnlock()
		return nil, errors.New("error: proximityTransport.Listen: one listener maximum")
	}
	t.lock.RUnlock()

	// Register this transport
	TransportMapMutex.Lock()
	TransportMap[t.driver.ProtocolName()] = t
	TransportMapMutex.Unlock()

	t.lock.Lock()
	defer t.lock.Unlock()

	t.listener = newListener(t.ctx, localMa, t)

	return t.listener, err
}

// ReceiveFromPeer is called by native driver when peer's device sent data.
// If the connection is not found, data is added in the transport cache level.
// If the connection is not actived yet, data is added in the connection cache level.
// Cache are circular buffer, avoiding RAM memory attack.
func (t *proximityTransport) ReceiveFromPeer(remotePID string, payload []byte) {
	t.logger.Debug("ReceiveFromPeer()", zap.String("remotePID", remotePID), logutil.PrivateBinary("payload", payload))

	// copy value from driver
	data := make([]byte, len(payload))
	copy(data, payload)

	t.connMapMutex.RLock()
	c, ok := t.connMap[remotePID]
	t.connMapMutex.RUnlock()
	if ok {
		// Put payload in the Conn cache if libp2p connection is not ready
		if !c.isReady() {
			c.Lock()
			if !c.ready {
				t.logger.Info("ReceiveFromPeer: connection is not ready to accept incoming packets, add it to cache")
				c.cache.Add(remotePID, data)
				c.Unlock()
				return
			}
			c.Unlock()
		}

		// Write the payload into pipe
		c.mp.input <- data
	} else {
		t.logger.Info("ReceiveFromPeer: no Conn found, put payload in cache")
		t.cache.Add(remotePID, data)
	}
}

// HandleFoundPeer is called by the native driver when a new peer is found.
// Adds the peer in the PeerStore and initiates a connection with it
func (t *proximityTransport) HandleFoundPeer(sRemotePID string) bool {
	t.logger.Debug("HandleFoundPeer", zap.String("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		t.logger.Error("HandleFoundPeer: wrong remote peerID")
		return false
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/%s/%s", t.driver.ProtocolName(), sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Checks if a listener is currently running.
	t.lock.RLock()

	if t.listener == nil || t.listener.ctx.Err() != nil {
		t.lock.RUnlock()
		t.logger.Error("HandleFoundPeer: listener not running")
		return false
	}

	// Get snapshot of listener
	listener := t.listener

	// unblock here to prevent blocking other APIs of Listener or Transport
	t.lock.RUnlock()

	// Adds peer to peerstore.
	t.host.Peerstore().AddAddr(remotePID, remoteMa,
		pstore.TempAddrTTL)

	// Delete previous cache if it exists
	t.cache.Delete(sRemotePID)

	// Peer with lexicographical smallest peerID inits libp2p connection.
	if listener.Addr().String() < sRemotePID {
		t.logger.Debug("HandleFoundPeer: outgoing libp2p connection")
		// Async connect so HandleFoundPeer can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			// Need to use listener than t.listener here to not have to check valid value of t.listener
			err := t.host.Connect(listener.ctx, peer.AddrInfo{
				ID:    remotePID,
				Addrs: []ma.Multiaddr{remoteMa},
			})
			if err != nil {
				t.logger.Error("HandleFoundPeer: async connect error", zap.Error(err))
				t.host.Peerstore().SetAddr(remotePID, remoteMa, -1)
				t.driver.CloseConnWithPeer(sRemotePID)
			}
		}()

		return true
	}

	t.logger.Debug("HandleFoundPeer: incoming libp2p connection")
	// Peer with lexicographical biggest peerID accepts incoming connection.
	// FIXME : consider to push this code in go routine to prevent blocking native driver
	select {
	case listener.inboundConnReq <- connReq{
		remoteMa:  remoteMa,
		remotePID: remotePID,
	}:
		return true
	case <-listener.ctx.Done():
		return false
	}
}

// HandleLostPeer is called by the native driver when the connection with the peer is lost.
// Closes connections with the peer.
func (t *proximityTransport) HandleLostPeer(sRemotePID string) {
	t.logger.Debug("HandleLostPeer", logutil.PrivateString("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		t.logger.Error("HandleLostPeer: wrong remote peerID")
		return
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/%s/%s", t.driver.ProtocolName(), sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Remove peer's address to peerstore.
	t.host.Peerstore().SetAddr(remotePID, remoteMa, -1)

	// Close the peer connection
	conns := t.host.Network().ConnsToPeer(remotePID)
	for _, conn := range conns {
		if conn.RemoteMultiaddr().Equal(remoteMa) {
			conn.Close()
		}
	}
}

func (t *proximityTransport) Log(level int, message string) {
	switch level {
	case Verbose, Debug:
		t.logger.Debug(message)
	case Info:
		t.logger.Info(message)
	case Warn:
		t.logger.Warn(message)
	case Error:
		t.logger.Error(message)
	}
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
