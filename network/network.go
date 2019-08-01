package network

import (
	"context"
	"sync"
	"time"

	host "berty.tech/network/host"
	"berty.tech/network/mdns"
	"berty.tech/network/protocol/berty"
	"go.uber.org/zap"
)

type Network struct {
	host *host.BertyHost

	handler func(*berty.Message, *berty.ConnMetadata)

	muHost sync.RWMutex

	rootCtx   context.Context
	cancelCtx context.CancelFunc

	cache PeerCache

	lrm *LocalRecordManager

	localContactID string
	joinTimer      *time.Timer
	muTimer        sync.Mutex

	mdns mdns.Service

	bootstrapAddrs []string
}

func defaultHandler(*berty.Message, *berty.ConnMetadata) {
	logger().Debug("default handler, receiving message")
}

func New(ctx context.Context, h *host.BertyHost, opts ...Option) (*Network, error) {
	ctx, cancel := context.WithCancel(ctx)

	net := &Network{
		rootCtx:   ctx,
		cancelCtx: cancel,

		handler:        defaultHandler,
		bootstrapAddrs: DefaultBootstrap,
		host:           h,
		cache:          NewNoopCache(),
		joinTimer:      time.NewTimer(0),
	}

	net.host.SetStreamHandler(ProtocolID, net.handleMessage)
	if err := net.apply(opts...); err != nil {
		return nil, err
	}

	net.lrm = NewLocalRecordManager(net, net.localContactID)

	// bootstrap default peers
	// TODO: infinite bootstrap + don't permit routing to provide when no
	// peers are discovered
	if err := net.Bootstrap(net.rootCtx, false); err != nil {
		logger().Error("bootstrap error", zap.Error(err))
	}

	if err := h.Routing().Bootstrap(ctx); err != nil {
		logger().Error("bootstrap error", zap.Error(err))
	}

	return net, nil
}

// UpdateHost
func (net *Network) UpdateHost(bh *host.BertyHost) {
	logger().Debug("host is updating")

	ctx, cancel := context.WithCancel(context.Background())

	net.joinTimer.Stop()
	bh.SetStreamHandler(ProtocolID, net.handleMessage)

	net.cancelCtx()
	net.muHost.Lock()

	if err := net.host.Close(); err != nil {
		logger().Warn("failed to close old host")
	}

	net.host = bh
	net.rootCtx = ctx
	net.cancelCtx = cancel

	net.muHost.Unlock()

	logger().Debug("bootstraping updated host")

	// bootstrap peers
	if err := net.Bootstrap(net.rootCtx, false); err != nil {
		logger().Error("bootstrap error", zap.Error(err))
	}

	// force network to provide localContactID again
	// if err := net.Join(); err != nil {
	// 	logger().Warn("join failed", zap.Error(err))
	// }

	net.logHostInfos()
}

func (net *Network) Close(_ context.Context) error {
	net.joinTimer.Stop()
	net.cancelCtx()

	// close host
	if net.host != nil {
		err := net.host.Close()
		if err != nil {
			logger().Error("p2p close error", zap.Error(err))
		}
	}
	return nil
}
