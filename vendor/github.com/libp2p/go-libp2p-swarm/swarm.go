package swarm

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	logging "github.com/ipfs/go-log"
	"github.com/jbenet/goprocess"
	goprocessctx "github.com/jbenet/goprocess/context"
	metrics "github.com/libp2p/go-libp2p-metrics"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	transport "github.com/libp2p/go-libp2p-transport"
	filter "github.com/libp2p/go-maddr-filter"
	mafilter "github.com/whyrusleeping/multiaddr-filter"
)

// DialTimeoutLocal is the maximum duration a Dial to local network address
// is allowed to take.
// This includes the time between dialing the raw network connection,
// protocol selection as well the handshake, if applicable.
var DialTimeoutLocal = 5 * time.Second

var log = logging.Logger("swarm2")

// ErrSwarmClosed is returned when one attempts to operate on a closed swarm.
var ErrSwarmClosed = errors.New("swarm closed")

// ErrAddrFiltered is returned when trying to register a connection to a
// filtered address. You shouldn't see this error unless some underlying
// transport is misbehaving.
var ErrAddrFiltered = errors.New("address filtered")

// Swarm is a connection muxer, allowing connections to other peers to
// be opened and closed, while still using the same Chan for all
// communication. The Chan sends/receives Messages, which note the
// destination or source Peer.
type Swarm struct {
	// Close refcount. This allows us to fully wait for the swarm to be torn
	// down before continuing.
	refs sync.WaitGroup

	local peer.ID
	peers pstore.Peerstore

	conns struct {
		sync.RWMutex
		m map[peer.ID][]*Conn
	}

	listeners struct {
		sync.RWMutex
		m map[transport.Listener]struct{}
	}

	notifs struct {
		sync.RWMutex
		m map[inet.Notifiee]struct{}
	}

	transports struct {
		sync.RWMutex
		m map[int]transport.Transport
	}

	// new connection and stream handlers
	connh   atomic.Value
	streamh atomic.Value

	// dialing helpers
	dsync   *DialSync
	backf   DialBackoff
	limiter *dialLimiter

	// filters for addresses that shouldnt be dialed (or accepted)
	Filters *filter.Filters

	proc goprocess.Process
	ctx  context.Context
	bwc  metrics.Reporter
}

// NewSwarm constructs a Swarm
func NewSwarm(ctx context.Context, local peer.ID, peers pstore.Peerstore, bwc metrics.Reporter) *Swarm {
	s := &Swarm{
		local:   local,
		peers:   peers,
		bwc:     bwc,
		Filters: filter.NewFilters(),
	}

	s.conns.m = make(map[peer.ID][]*Conn)
	s.listeners.m = make(map[transport.Listener]struct{})
	s.transports.m = make(map[int]transport.Transport)
	s.notifs.m = make(map[inet.Notifiee]struct{})

	s.dsync = NewDialSync(s.doDial)
	s.limiter = newDialLimiter(s.dialAddr)
	s.proc = goprocessctx.WithContextAndTeardown(ctx, s.teardown)
	s.ctx = goprocessctx.OnClosingContext(s.proc)

	return s
}

func (s *Swarm) teardown() error {
	// Prevents new connections and/or listeners from being added to the swarm.

	s.listeners.Lock()
	listeners := s.listeners.m
	s.listeners.m = nil
	s.listeners.Unlock()

	s.conns.Lock()
	conns := s.conns.m
	s.conns.m = nil
	s.conns.Unlock()

	// Lots of go routines but we might as well do this in parallel. We want
	// to shut down as fast as possible.

	for l := range listeners {
		go func(l transport.Listener) {
			if err := l.Close(); err != nil {
				log.Errorf("error when shutting down listener: %s", err)
			}
		}(l)
	}

	for _, cs := range conns {
		for _, c := range cs {
			go func(c *Conn) {
				if err := c.Close(); err != nil {
					log.Errorf("error when shutting down connection: %s", err)
				}
			}(c)
		}
	}

	// Wait for everything to finish.
	s.refs.Wait()

	return nil
}

// AddAddrFilter adds a multiaddr filter to the set of filters the swarm will
// use to determine which addresses not to dial to.
func (s *Swarm) AddAddrFilter(f string) error {
	m, err := mafilter.NewMask(f)
	if err != nil {
		return err
	}

	s.Filters.AddDialFilter(m)
	return nil
}

// Process returns the Process of the swarm
func (s *Swarm) Process() goprocess.Process {
	return s.proc
}

func (s *Swarm) addConn(tc transport.Conn) (*Conn, error) {
	// The underlying transport (or the dialer) *should* filter it's own
	// connections but we should double check anyways.
	raddr := tc.RemoteMultiaddr()
	if s.Filters.AddrBlocked(raddr) {
		tc.Close()
		return nil, ErrAddrFiltered
	}

	p := tc.RemotePeer()

	// Add the public key.
	if pk := tc.RemotePublicKey(); pk != nil {
		s.peers.AddPubKey(p, pk)
	}

	// Clear any backoffs
	s.backf.Clear(p)

	// Finally, add the peer.
	s.conns.Lock()
	// Check if we're still online
	if s.conns.m == nil {
		s.conns.Unlock()
		tc.Close()
		return nil, ErrSwarmClosed
	}

	// Wrap and register the connection.
	c := &Conn{
		conn:  tc,
		swarm: s,
	}
	c.streams.m = make(map[*Stream]struct{})
	s.conns.m[p] = append(s.conns.m[p], c)

	// Add two swarm refs:
	// * One will be decremented after the close notifications fire in Conn.doClose
	// * The other will be decremented when Conn.start exits.
	s.refs.Add(2)

	// Take the notification lock before releasing the conns lock to block
	// Disconnect notifications until after the Connect notifications done.
	c.notifyLk.Lock()
	s.conns.Unlock()

	// We have a connection now. Cancel all other in-progress dials.
	// This should be fast, no reason to wait till later.
	s.dsync.CancelDial(p)

	s.notifyAll(func(f inet.Notifiee) {
		f.Connected(s, c)
	})
	c.notifyLk.Unlock()

	c.start()

	// TODO: Get rid of this. We use it for identify but that happen much
	// earlier (really, inside the transport and, if not then, during the
	// notifications).
	if h := s.ConnHandler(); h != nil {
		go h(c)
	}

	return c, nil
}

// Peerstore returns this swarms internal Peerstore.
func (s *Swarm) Peerstore() pstore.Peerstore {
	return s.peers
}

// Context returns the context of the swarm
func (s *Swarm) Context() context.Context {
	return s.ctx
}

// Close stops the Swarm.
func (s *Swarm) Close() error {
	return s.proc.Close()
}

// TODO: We probably don't need the conn handlers.

// SetConnHandler assigns the handler for new connections.
// You will rarely use this. See SetStreamHandler
func (s *Swarm) SetConnHandler(handler inet.ConnHandler) {
	s.connh.Store(handler)
}

// ConnHandler gets the handler for new connections.
func (s *Swarm) ConnHandler() inet.ConnHandler {
	handler, _ := s.connh.Load().(inet.ConnHandler)
	return handler
}

// SetStreamHandler assigns the handler for new streams.
func (s *Swarm) SetStreamHandler(handler inet.StreamHandler) {
	s.streamh.Store(handler)
}

// StreamHandler gets the handler for new streams.
func (s *Swarm) StreamHandler() inet.StreamHandler {
	handler, _ := s.streamh.Load().(inet.StreamHandler)
	return handler
}

// NewStream creates a new stream on any available connection to peer, dialing
// if necessary.
func (s *Swarm) NewStream(ctx context.Context, p peer.ID) (inet.Stream, error) {
	log.Debugf("[%s] opening stream to peer [%s]", s.local, p)

	// Algorithm:
	// 1. Find the best connection, otherwise, dial.
	// 2. Try opening a stream.
	// 3. If the underlying connection is, in fact, closed, close the outer
	//    connection and try again. We do this in case we have a closed
	//    connection but don't notice it until we actually try to open a
	//    stream.
	//
	// Note: We only dial once.
	//
	// TODO: Try all connections even if we get an error opening a stream on
	// a non-closed connection.
	dials := 0
	for {
		c := s.bestConnToPeer(p)
		if c == nil {
			if dials >= DialAttempts {
				return nil, errors.New("max dial attempts exceeded")
			}
			dials++

			var err error
			c, err = s.dialPeer(ctx, p)
			if err != nil {
				return nil, err
			}
		}
		s, err := c.NewStream()
		if err != nil {
			if c.conn.IsClosed() {
				continue
			}
			return nil, err
		}
		return s, nil
	}
}

// ConnsToPeer returns all the live connections to peer.
func (s *Swarm) ConnsToPeer(p peer.ID) []inet.Conn {
	// TODO: Consider sorting the connection list best to worst. Currently,
	// it's sorted oldest to newest.
	s.conns.RLock()
	defer s.conns.RUnlock()
	conns := s.conns.m[p]
	output := make([]inet.Conn, len(conns))
	for i, c := range conns {
		output[i] = c
	}
	return output
}

// bestConnToPeer returns the best connection to peer.
func (s *Swarm) bestConnToPeer(p peer.ID) *Conn {
	// Selects the best connection we have to the peer.
	// TODO: Prefer some transports over others. Currently, we just select
	// the newest non-closed connection with the most streams.
	s.conns.RLock()
	defer s.conns.RUnlock()

	var best *Conn
	bestLen := 0
	for _, c := range s.conns.m[p] {
		if c.conn.IsClosed() {
			// We *will* garbage collect this soon anyways.
			continue
		}
		c.streams.Lock()
		cLen := len(c.streams.m)
		c.streams.Unlock()

		if cLen >= bestLen {
			best = c
			bestLen = cLen
		}

	}
	return best
}

// Connectedness returns our "connectedness" state with the given peer.
//
// To check if we have an open connection, use `s.Connectedness(p) ==
// inet.Connected`.
func (s *Swarm) Connectedness(p peer.ID) inet.Connectedness {
	if s.bestConnToPeer(p) != nil {
		return inet.Connected
	}
	return inet.NotConnected
}

// Conns returns a slice of all connections.
func (s *Swarm) Conns() []inet.Conn {
	s.conns.RLock()
	defer s.conns.RUnlock()

	conns := make([]inet.Conn, 0, len(s.conns.m))
	for _, cs := range s.conns.m {
		for _, c := range cs {
			conns = append(conns, c)
		}
	}
	return conns
}

// ClosePeer closes all connections to the given peer.
func (s *Swarm) ClosePeer(p peer.ID) error {
	conns := s.ConnsToPeer(p)
	switch len(conns) {
	case 0:
		return nil
	case 1:
		return conns[0].Close()
	default:
		errCh := make(chan error)
		for _, c := range conns {
			go func(c inet.Conn) {
				errCh <- c.Close()
			}(c)
		}

		var errs []string
		for _ = range conns {
			err := <-errCh
			if err != nil {
				errs = append(errs, err.Error())
			}
		}
		if len(errs) > 0 {
			return fmt.Errorf("when disconnecting from peer %s: %s", p, strings.Join(errs, ", "))
		}
		return nil
	}
}

// Peers returns a copy of the set of peers swarm is connected to.
func (s *Swarm) Peers() []peer.ID {
	s.conns.RLock()
	defer s.conns.RUnlock()
	peers := make([]peer.ID, 0, len(s.conns.m))
	for p := range s.conns.m {
		peers = append(peers, p)
	}

	return peers
}

// LocalPeer returns the local peer swarm is associated to.
func (s *Swarm) LocalPeer() peer.ID {
	return s.local
}

// Backoff returns the DialBackoff object for this swarm.
func (s *Swarm) Backoff() *DialBackoff {
	return &s.backf
}

// notifyAll sends a signal to all Notifiees
func (s *Swarm) notifyAll(notify func(inet.Notifiee)) {
	var wg sync.WaitGroup

	s.notifs.RLock()
	wg.Add(len(s.notifs.m))
	for f := range s.notifs.m {
		go func(f inet.Notifiee) {
			defer wg.Done()
			notify(f)
		}(f)
	}

	wg.Wait()
	s.notifs.RUnlock()
}

// Notify signs up Notifiee to receive signals when events happen
func (s *Swarm) Notify(f inet.Notifiee) {
	s.notifs.Lock()
	s.notifs.m[f] = struct{}{}
	s.notifs.Unlock()
}

// StopNotify unregisters Notifiee fromr receiving signals
func (s *Swarm) StopNotify(f inet.Notifiee) {
	s.notifs.Lock()
	delete(s.notifs.m, f)
	s.notifs.Unlock()
}

func (s *Swarm) removeConn(c *Conn) {
	p := c.RemotePeer()

	s.conns.Lock()
	defer s.conns.Unlock()
	cs := s.conns.m[p]
	for i, ci := range cs {
		if ci == c {
			if len(cs) == 1 {
				delete(s.conns.m, p)
			} else {
				// NOTE: We're intentionally preserving order.
				// This way, connections to a peer are always
				// sorted oldest to newest.
				copy(cs[i:], cs[i+1:])
				cs[len(cs)-1] = nil
				s.conns.m[p] = cs[:len(cs)-1]
			}
			return
		}
	}
}

// String returns a string representation of Network.
func (s *Swarm) String() string {
	return fmt.Sprintf("<Swarm %s>", s.LocalPeer())
}

// Swarm is a Network.
var _ inet.Network = (*Swarm)(nil)
var _ transport.Network = (*Swarm)(nil)
