package ipfsutil

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/libp2p/go-libp2p-core/connmgr"
	"github.com/libp2p/go-libp2p-core/event"
	host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/logutil"
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

	peering *PeeringService
	ps      *ping.PingService
	h       host.Host
	lm      *lifecycle.Manager
}

func NewConnLifecycle(logger *zap.Logger, h host.Host, ps *PeeringService, lm *lifecycle.Manager) (*ConnLifecycle, error) {
	ctx, cancel := context.WithCancel(context.Background())
	cl := &ConnLifecycle{
		peering:    ps,
		rootCtx:    ctx,
		rootCancel: cancel,
		logger:     logger.Named("ipfs-lc"),
		ps:         ping.NewPingService(h),
		h:          h,
		lm:         lm,
	}

	go cl.handleLifecycle()

	if err := cl.monitorConnection(ctx); err != nil {
		return nil, err
	}

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

func (cl *ConnLifecycle) dropUnavailableConn() {
	cl.logger.Debug("droping unavailable conn")

	peers := make(map[peer.ID]struct{})
	for _, c := range cl.h.Network().Conns() {
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

			// if we are here, conn should be kill
			if err := cl.h.Network().ClosePeer(peer); err != nil {
				cl.logger.Warn("unable to close connection", zap.Error(err))
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

func (cl *ConnLifecycle) monitorConnection(ctx context.Context) error {
	sub, err := cl.h.EventBus().Subscribe([]interface{}{
		new(event.EvtPeerConnectednessChanged),
		new(EvtPeerTag),
	})
	if err != nil {
		return fmt.Errorf("unable to subscribe to `EvtPeerConnectednessChanged`: %w", err)
	}

	for _, p := range cl.h.Peerstore().Peers() {
		if tag := cl.h.ConnManager().GetTagInfo(p); tag != nil && tag.Value >= ConnPeerOfInterestMinScore {
			infos := cl.h.Peerstore().PeerInfo(p)
			cl.peering.AddPeer(infos)
			cl.logger.Debug("adding peer of interest", logutil.PrivateStringer("peer", p), zap.Int("score", tag.Value))
		}
	}

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
				if evt.Total >= ConnPeerOfInterestMinScore && oldTotal < ConnPeerOfInterestMinScore {
					infos := cl.h.Peerstore().PeerInfo(evt.Peer)
					cl.peering.AddPeer(infos)
					cl.logger.Debug("marking peer as peer of interest",
						logutil.PrivateStringer("peer", evt.Peer), zap.Int("score", evt.Total), zap.Int("diff", evt.Diff), zap.String("last_tag", evt.Tag))
				} else if evt.Total < ConnPeerOfInterestMinScore && oldTotal >= ConnPeerOfInterestMinScore {
					cl.peering.RemovePeer(evt.Peer)
					cl.logger.Debug("unmarking peer as peer of interest",
						logutil.PrivateStringer("peer", evt.Peer), zap.Int("score", evt.Total), zap.Int("diff", evt.Diff), zap.String("last_tag", evt.Tag))
				}
			case event.EvtPeerConnectednessChanged:
			}
		}
	}()

	return nil
}
