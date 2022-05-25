package ipfsutil

import (
	"context"
	"fmt"
	"reflect"
	"sync"
	"sync/atomic"
	"time"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"github.com/libp2p/go-libp2p-core/connmgr"
	"github.com/libp2p/go-libp2p-core/event"
	host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"
	"go.uber.org/zap"
)

var (
	ConnLifecycleGracePeriod   = time.Second
	ConnLifecyclePingTimeout   = time.Second * 5
	ConnPeerOfInterestMinScore = 20
)

type ConnLifecycle struct {
	connmgr.ConnManager

	rootCtx    context.Context
	rootCancel context.CancelFunc
	logger     *zap.Logger

	peers   map[peer.ID]int
	muPeers sync.RWMutex

	ps *ping.PingService
	h  host.Host
	lm *lifecycle.Manager
}

func NewConnLifecycle(logger *zap.Logger, h host.Host, lm *lifecycle.Manager) (*ConnLifecycle, error) {
	ctx, cancel := context.WithCancel(context.Background())
	cl := &ConnLifecycle{
		rootCtx:    ctx,
		rootCancel: cancel,
		logger:     logger.Named("ipfs-lc"),
		ps:         ping.NewPingService(h),
		h:          h,
		lm:         lm,
		peers:      make(map[peer.ID]int),
	}

	go cl.handleLifecycle()
	go cl.monitorConnection(ctx)

	cl.logger.Debug("lifecycle conn started")
	return cl, nil
}

func (cl *ConnLifecycle) Close() error {
	cl.rootCancel()
	return nil
}

func (cl *ConnLifecycle) handleLifecycle() {
	currentState := lifecycle.StateActive
	for {
		start := time.Now()
		if !cl.lm.WaitForStateChange(cl.rootCtx, currentState) {
			return
		}
		currentState = cl.lm.GetCurrentState()

		if time.Since(start) <= ConnLifecycleGracePeriod {
			continue
		}

		switch currentState {
		case lifecycle.StateInactive:
			cl.logger.Debug("inactive mode")
		case lifecycle.StateActive:
			cl.logger.Debug("active mode")
			go cl.dropUnavailableConn()
		}
	}
}

var closedChan = reflect.ValueOf(nil)

func (cl *ConnLifecycle) dropUnavailableConn() {
	cl.logger.Debug("droping unavailable conn")

	peers := make(map[peer.ID]struct{})
	for _, c := range cl.h.Network().Conns() {
		// checking Transient state
		// if c.Stat().Transient && !cl.isPeerOfInterest(c.RemotePeer()) {
		// 	continue
		// }

		if _, ok := peers[c.RemotePeer()]; !ok {
			peers[c.RemotePeer()] = struct{}{}
		}
	}

	unavailable := uint32(0)
	wg := sync.WaitGroup{}
	ctx, cancel := context.WithCancel(cl.rootCtx)
	for p := range peers {
		cping := cl.ps.Ping(ctx, p)
		wg.Add(1)
		go func(peer peer.ID) {
			defer wg.Done()

			select {
			case ret := <-cping:
				if ret.Error == nil {
					return // everything should be ok
				}
			case <-time.After(ConnLifecyclePingTimeout):
			}

			// connection should be dead
			atomic.AddUint32(&unavailable, 1)

			info := cl.h.Peerstore().PeerInfo(peer)

			// if we are here, conn should be kill
			if err := cl.h.Network().ClosePeer(peer); err != nil {
				cl.logger.Warn("unable to close connection", zap.Error(err))
			}

			if cl.isPeerOfInterest(peer) {
				cl.logger.Debug("a connection to peer of interstest has been drop, reconnecting", zap.Stringer("peer", peer))
				go cl.tryReconnect(cl.rootCtx, info)
			}
		}(p)
	}

	wg.Wait()
	cancel()

	if unavailable > 0 {
		available := uint32(len(peers)) - unavailable
		cl.logger.Debug("dropped unavailable peers", zap.Uint32("available", available), zap.Uint32("unavailable", unavailable))
	} else {
		cl.logger.Debug("all peers are available")
	}
}

func (cl *ConnLifecycle) tryReconnect(ctx context.Context, pinfo peer.AddrInfo) {
	ctx, cancel := context.WithTimeout(ctx, ConnLifecyclePingTimeout)
	if err := cl.h.Connect(ctx, pinfo); err != nil {
		cl.logger.Error("unable to reconnect to peer", zap.Stringer("peer", pinfo.ID), zap.Error(err))
	} else {
		cl.logger.Debug("reconnected to peer of interest", zap.Stringer("peer", pinfo.ID))
	}
	cancel()
}

func (cl *ConnLifecycle) isPeerOfInterest(p peer.ID) (yes bool) {
	cl.muPeers.RLock()
	if score, ok := cl.peers[p]; ok {
		yes = score >= ConnPeerOfInterestMinScore
	}
	cl.muPeers.RUnlock()
	return
}

func (cl *ConnLifecycle) monitorConnection(ctx context.Context) error {
	sub, err := cl.h.EventBus().Subscribe([]interface{}{
		new(event.EvtPeerConnectednessChanged),
		new(EvtPeerTag),
	})
	if err != nil {
		return fmt.Errorf("unable to subscribe to `EvtPeerConnectednessChanged`: %w", err)
	}

	cl.muPeers.Lock()
	for _, p := range cl.h.Peerstore().Peers() {
		if tag := cl.h.ConnManager().GetTagInfo(p); tag != nil && tag.Value >= ConnPeerOfInterestMinScore {
			cl.peers[p] = tag.Value
			cl.logger.Debug("existing peer of interest", zap.Stringer("peer", p), zap.Int("score", tag.Value))
		}

	}
	cl.muPeers.Unlock()

	go func() {
		defer sub.Close()
		for {
			var e interface{}
			select {
			case e = <-sub.Out():
			case <-ctx.Done():
				return
			}

			switch evt := e.(type) {
			case EvtPeerTag:
				oldTotal := evt.Total - evt.Diff
				cl.muPeers.Lock()

				if evt.Total >= ConnPeerOfInterestMinScore && oldTotal < ConnPeerOfInterestMinScore {
					cl.peers[evt.Peer] = evt.Total
					cl.logger.Debug("marking peer as peer of interest",
						zap.Stringer("peer", evt.Peer), zap.Int("score", evt.Total), zap.Int("diff", evt.Diff), zap.String("last_tag", evt.Tag))
				} else if evt.Total < ConnPeerOfInterestMinScore && oldTotal >= ConnPeerOfInterestMinScore {
					delete(cl.peers, evt.Peer)
					cl.logger.Debug("unmarking peer as peer of interest",
						zap.Stringer("peer", evt.Peer), zap.Int("score", evt.Total), zap.Int("diff", evt.Diff), zap.String("last_tag", evt.Tag))
				}

				cl.muPeers.Unlock()
			case event.EvtPeerConnectednessChanged:
				if evt.Connectedness != network.Connected && cl.isPeerOfInterest(evt.Peer) {
					cl.logger.Debug("peer of interest has been disconnected, reconnecting", zap.Stringer("peer", evt.Peer))
					info := cl.h.Peerstore().PeerInfo(evt.Peer)

					// we were disconected from peer of interest, try reconnect
					go cl.tryReconnect(ctx, info)
				}
			}
		}
	}()

	return nil
}
