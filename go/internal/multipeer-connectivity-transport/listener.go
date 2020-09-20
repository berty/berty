package mc

import (
	"context"
	"errors"
	"net"
	"sync"

	peer "github.com/libp2p/go-libp2p-core/peer"
	tpt "github.com/libp2p/go-libp2p-core/transport"
	ma "github.com/multiformats/go-multiaddr"

	mcdrv "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/driver"
	mcma "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/multiaddr"
)

// Global listener is used by discovery (to send incoming conn request to Accept())
// and transport (to ensure that only one listener is running at a time).
var (
	gListener *Listener
	gLock     sync.RWMutex
)

// Listener is a tpt.Listener.
var _ tpt.Listener = &Listener{}

// Listener is an interface closely resembling the net.Listener interface. The
// only real difference is that Accept() returns Conn's of the type in this
// package, and also exposes a Multiaddr method as opposed to a regular Addr
// method.
type Listener struct {
	transport      *Transport
	localMa        ma.Multiaddr
	inboundConnReq chan connReq // Chan used to accept inbound conn.
	ctx            context.Context
	cancel         func()
}

// connReq holds data necessary for inbound conn creation.
type connReq struct {
	remoteMa  ma.Multiaddr
	remotePID peer.ID
}

// newListener starts the native driver then returns a new Listener.
func newListener(localMa ma.Multiaddr, t *Transport) *Listener {
	ctx, cancel := context.WithCancel(context.Background())

	listener := &Listener{
		transport:      t,
		localMa:        localMa,
		inboundConnReq: make(chan connReq),
		ctx:            ctx,
		cancel:         cancel,
	}

	// Starts the native driver.
	// If it failed, don't return a error because no other transport
	// on the libp2p node will be created.
	mcdrv.StartMCDriver(t.host.ID().Pretty())

	// Sets listener as global listener
	gLock.Lock()
	gListener = listener
	gLock.Unlock()

	return listener
}

// Accept waits for and returns the next connection to the listener.
// Returns a Multiaddr friendly Conn.
func (l *Listener) Accept() (tpt.CapableConn, error) {
	for {
		select {
		case req := <-l.inboundConnReq:
			conn, err := newConn(l.ctx, l.transport, req.remoteMa, req.remotePID, true)
			// If the newConn failed for some reason, Accept won't return an error
			// because otherwise it will close the listener
			if err == nil {
				return conn, nil
			}
		case <-l.ctx.Done():
			return nil, errors.New("listener accept failed: listener already closed")
		}
	}
}

// Close closes the listener.
// Any blocked Accept operations will be unblocked and return errors.
func (l *Listener) Close() error {
	l.cancel()

	// Stops the native driver.
	mcdrv.StopMCDriver()

	// Removes global listener so transport can instantiate a new one later.
	gLock.Lock()
	gListener = nil
	gLock.Unlock()

	return nil
}

// Multiaddr returns the listener's (local) Multiaddr.
func (l *Listener) Multiaddr() ma.Multiaddr { return l.localMa }

// Addr returns the net.Listener's network address.
func (l *Listener) Addr() net.Addr {
	lAddr, _ := l.localMa.ValueForProtocol(mcma.P_MC)
	return &Addr{
		Address: lAddr,
	}
}
