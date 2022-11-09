// mostly from: https://github.com/ipfs/kubo/blob/master/peering/peering.go

package ipfsutil

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	backoff "github.com/libp2p/go-libp2p/p2p/discovery/backoff"
	"github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

// Seed the random number generator.
//
// We don't need good randomness, but we do need randomness.
const (
	connmgrTag = "berty-peering"

	// MaximumReconnectingDelay define the maximum time a peer is able to
	// reconnect, if reached peer will be remove from the store
	MaximumReconnectingDelay = time.Second * 30
)

type state int

const (
	stateInit state = iota
	stateRunning
	stateStopped
)

// PeeringService maintains connections to specified peers, reconnecting on
// disconnect with a back-off.
type PeeringService struct {
	host           host.Host
	logger         *zap.Logger
	backoffFactory backoff.BackoffFactory

	muPeers sync.RWMutex
	peers   map[peer.ID]*peerHandler
	state   state
}

// NewPeeringService constructs a new peering service. Peers can be added and
// removed immediately, but connections won't be formed until `Start` is called.
func NewPeeringService(logger *zap.Logger, host host.Host, fact backoff.BackoffFactory) *PeeringService {
	return &PeeringService{
		backoffFactory: fact,
		logger:         logger,
		host:           host,
		peers:          make(map[peer.ID]*peerHandler),
	}
}

// Start starts the peering service, connecting and maintaining connections to
// all registered peers. It returns an error if the service has already been
// stopped.
func (ps *PeeringService) Start() error {
	ps.muPeers.Lock()
	defer ps.muPeers.Unlock()

	switch ps.state {
	case stateInit:
		ps.logger.Info("starting peering service")
	case stateRunning:
		return nil
	case stateStopped:
		return errors.New("peering service already stopped")
	}
	ps.host.Network().Notify((*netNotifee)(ps))
	ps.state = stateRunning
	for _, handler := range ps.peers {
		go handler.startIfDisconnected()
	}
	return nil
}

// Stop stops the peering service.
func (ps *PeeringService) Stop() error {
	ps.host.Network().StopNotify((*netNotifee)(ps))

	ps.muPeers.Lock()
	defer ps.muPeers.Unlock()

	switch ps.state {
	case stateInit, stateRunning:
		ps.logger.Info("stopping peering service")
		for _, handler := range ps.peers {
			handler.stop()
		}
		ps.state = stateStopped
	}
	return nil
}

// AddPeer adds a peer to the peering service. This function may be safely
// called at any time: before the service is started, while running, or after it
// stops.
//
// Add peer may also be called multiple times for the same peer. The new
// addresses will replace the old.
func (ps *PeeringService) AddPeer(info peer.AddrInfo) {
	ps.muPeers.Lock()
	handler, ok := ps.peers[info.ID]
	ps.muPeers.Unlock()

	if ok {
		ps.logger.Info("updating addresses", logutil.PrivateStringer("peer", info.ID), zap.Any("addrs", info.Addrs))
		handler.setAddrs(info.Addrs)
	} else {
		ps.logger.Info("peer added", logutil.PrivateStringer("peer", info.ID), zap.Any("addrs", info.Addrs))
		ps.host.ConnManager().Protect(info.ID, connmgrTag)
		handler = &peerHandler{
			logger:       ps.logger,
			host:         ps.host,
			peer:         info.ID,
			addrs:        info.Addrs,
			backoffStrat: ps.backoffFactory(),
		}

		handler.ctx, handler.cancel = context.WithCancel(context.Background())
		ps.peers[info.ID] = handler
		switch ps.state {
		case stateRunning:
			go handler.startIfDisconnected()
		case stateStopped:
			// We still construct everything in this state because
			// it's easier to reason about. But we should still free
			// resources.
			handler.cancel()
		}
	}
}

// ListPeers lists peers in the peering service.
func (ps *PeeringService) ListPeers() []peer.AddrInfo {
	ps.muPeers.RLock()
	defer ps.muPeers.RUnlock()

	out := make([]peer.AddrInfo, 0, len(ps.peers))
	for id, addrs := range ps.peers {
		ai := peer.AddrInfo{ID: id}
		ai.Addrs = append(ai.Addrs, addrs.addrs...)
		out = append(out, ai)
	}
	return out
}

// RemovePeer removes a peer from the peering service. This function may be
// safely called at any time: before the service is started, while running, or
// after it stops.
func (ps *PeeringService) RemovePeer(id peer.ID) {
	ps.muPeers.Lock()
	defer ps.muPeers.Unlock()

	if handler, ok := ps.peers[id]; ok {
		ps.logger.Info("peer removed", logutil.PrivateStringer("peer", id))
		ps.host.ConnManager().Unprotect(id, connmgrTag)

		handler.stop()
		delete(ps.peers, id)
	}
}

type netNotifee PeeringService

func (nn *netNotifee) Connected(_ network.Network, c network.Conn) {
	ps := (*PeeringService)(nn)

	p := c.RemotePeer()
	ps.muPeers.RLock()
	defer ps.muPeers.RUnlock()

	if handler, ok := ps.peers[p]; ok {
		// use a goroutine to avoid blocking events.
		go handler.stopIfConnected()
	}
}

func (nn *netNotifee) Disconnected(_ network.Network, c network.Conn) {
	ps := (*PeeringService)(nn)

	p := c.RemotePeer()
	ps.muPeers.RLock()
	defer ps.muPeers.RUnlock()

	if handler, ok := ps.peers[p]; ok {
		// use a goroutine to avoid blocking events.
		go handler.startIfDisconnected()
	}
}
func (nn *netNotifee) OpenedStream(network.Network, network.Stream)     {}
func (nn *netNotifee) ClosedStream(network.Network, network.Stream)     {}
func (nn *netNotifee) Listen(network.Network, multiaddr.Multiaddr)      {}
func (nn *netNotifee) ListenClose(network.Network, multiaddr.Multiaddr) {}

// peerHandler keeps track of all state related to a specific "peering" peer.
type peerHandler struct {
	peer   peer.ID
	host   host.Host
	ctx    context.Context
	cancel context.CancelFunc
	logger *zap.Logger

	addrs          []multiaddr.Multiaddr
	backoffStrat   backoff.BackoffStrategy
	reconnectTimer *time.Timer

	muHandler sync.Mutex
}

// setAddrs sets the addresses for this peer.
func (ph *peerHandler) setAddrs(addrs []multiaddr.Multiaddr) {
	// Not strictly necessary, but it helps to not trust the calling code.
	addrCopy := make([]multiaddr.Multiaddr, len(addrs))
	copy(addrCopy, addrs)

	ph.muHandler.Lock()
	ph.addrs = addrCopy
	ph.muHandler.Unlock()
}

// getAddrs returns a shared slice of addresses for this peer. Do not modify.
func (ph *peerHandler) getAddrs() []multiaddr.Multiaddr {
	ph.muHandler.Lock()
	defer ph.muHandler.Unlock()
	return ph.addrs
}

// stop permanently stops the peer handler.
func (ph *peerHandler) stop() {
	ph.cancel()

	ph.muHandler.Lock()

	if ph.reconnectTimer != nil {
		ph.reconnectTimer.Stop()
		ph.reconnectTimer = nil
	}

	ph.muHandler.Unlock()
}

func (ph *peerHandler) nextBackoff() time.Duration {
	return ph.backoffStrat.Delay()
}

func (ph *peerHandler) reconnect() {
	// Try connecting
	addrs := ph.getAddrs()
	ph.logger.Debug("reconnecting", logutil.PrivateStringer("peer", ph.peer), zap.Any("addrs", addrs))

	err := ph.host.Connect(ph.ctx, peer.AddrInfo{ID: ph.peer, Addrs: addrs})
	if err != nil {
		delay := ph.nextBackoff()
		if delay > MaximumReconnectingDelay {
			ph.logger.Debug("peer unavailable", logutil.PrivateStringer("peer", ph.peer))
			ph.stop()
			return
		}

		ph.logger.Debug("failed to reconnect", zap.Duration("next_try", delay), logutil.PrivateStringer("peer", ph.peer), zap.Error(err))
		// Ok, we failed. Extend the timeout.
		ph.muHandler.Lock()
		if ph.reconnectTimer != nil {
			// Only counts if the reconnectTimer still exists. If not, a
			// connection _was_ somehow established.
			ph.reconnectTimer.Reset(delay)
		}
		// Otherwise, someone else has stopped us so we can assume that
		// we're either connected or someone else will start us.
		ph.muHandler.Unlock()
	}

	// Always call this. We could have connected since we processed the
	// error.
	ph.stopIfConnected()
}

func (ph *peerHandler) stopIfConnected() {
	ph.muHandler.Lock()
	defer ph.muHandler.Unlock()

	if ph.reconnectTimer != nil && ph.host.Network().Connectedness(ph.peer) == network.Connected {
		ph.logger.Debug("successfully reconnected", logutil.PrivateStringer("peer", ph.peer))

		// stop reconnect timer
		ph.reconnectTimer.Stop()
		ph.reconnectTimer = nil
	}
}

// startIfDisconnected is the inverse of stopIfConnected.
func (ph *peerHandler) startIfDisconnected() {
	ph.muHandler.Lock()
	defer ph.muHandler.Unlock()

	if ph.reconnectTimer == nil && ph.host.Network().Connectedness(ph.peer) != network.Connected {
		// reset backoff
		ph.backoffStrat.Reset()

		delay := ph.nextBackoff()
		ph.logger.Debug("disconnected from peer, waiting for reconnection", logutil.PrivateStringer("peer", ph.peer), zap.Duration("delay", delay))

		// Always start with a short timeout so we can stagger things a bit.
		ph.reconnectTimer = time.AfterFunc(delay, ph.reconnect)
	}
}
