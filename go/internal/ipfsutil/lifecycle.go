package ipfsutil

import (
	"context"
	"fmt"
	"reflect"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/lifecycle"
	host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p/p2p/protocol/ping"
	"go.uber.org/zap"
)

var (
	ConnLifecycleGracePeriod = time.Second * 2
	ConnLifecyclePingTimeout = time.Second * 5
)

type ConnLifecycle struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc
	logger     *zap.Logger

	peers   map[peer.ID]struct{}
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
		peers:      make(map[peer.ID]struct{}),
	}

	go cl.handleLifecycle()

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

		if time.Since(start) <= ConnLifecycleGracePeriod {
			continue
		}

		currentState = cl.lm.GetCurrentState()

		switch currentState {
		case lifecycle.StateInactive:
			cl.logger.Debug("inactive mode")
		case lifecycle.StateActive:
			cl.logger.Debug("active mode")
			cl.dropUnavailableConn()
		}
	}
}

var closedChan = reflect.ValueOf(nil)

func (cl *ConnLifecycle) dropUnavailableConn() {
	ctx, cancel := context.WithTimeout(cl.rootCtx, ConnLifecyclePingTimeout)
	defer cancel()

	conns := cl.h.Network().Conns()
	nsels := len(conns)
	selCases := make([]reflect.SelectCase, nsels)
	for i, conn := range conns {
		cping := cl.ps.Ping(ctx, conn.RemotePeer())
		selCases[i] = reflect.SelectCase{
			Dir:  reflect.SelectRecv,
			Chan: reflect.ValueOf(cping),
		}
	}

	for n := nsels; n > 0; n-- {
		sel, value, ok := reflect.Select(selCases)
		conn := conns[sel]
		var err error
		if ok {
			ret := value.Interface().(ping.Result)
			if ret.Error == nil {
				continue // everything should be ok
			}

			err = ret.Error
		} else {
			// The chosen channel has been closed, so zero out the channel to disable the case
			selCases[sel].Chan = closedChan
			err = fmt.Errorf("no response in time")
		}

		cl.logger.Debug("dropping unavailable conn",
			zap.String("peer", conn.RemotePeer().String()),
			zap.String("conn", conn.RemoteMultiaddr().String()),
			zap.Error(err),
		)

		// if we are here, conn should be kill
		if err := cl.h.Network().ClosePeer(conn.RemotePeer()); err != nil {
			cl.logger.Warn("unable to close connection", zap.Error(err))
		}
	}
}
