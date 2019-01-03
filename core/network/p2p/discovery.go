package p2p

import (
	"context"

	"berty.tech/core/pkg/tracing"
	cid "github.com/ipfs/go-cid"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/libp2p/go-libp2p/p2p/discovery"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// driverDiscoveryNotify is a inet.Notifiee
var _ inet.Notifiee = (*driverDiscoveryNotify)(nil)

// driverDiscoveryNotify is a discovery.Notifiee
var _ discovery.Notifee = (*driverDiscoveryNotify)(nil)

type driverDiscoveryNotify Driver

func DiscoveryNotify(ctx context.Context, d *Driver) discovery.Notifee {
	tracer := tracing.EnterFunc(ctx, d)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return (*driverDiscoveryNotify)(d)
}

func Notify(ctx context.Context, d *Driver) inet.Notifiee {
	tracer := tracing.EnterFunc(ctx, d)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return (*driverDiscoveryNotify)(d)
}

// Driver Notify
func (ddn *driverDiscoveryNotify) HandlePeerFound(pi pstore.PeerInfo) {
	tracer := tracing.EnterFunc(ddn.rootContext, pi)
	defer tracer.Finish()
	ctx := tracer.Context()

	if err := ddn.host.Connect(ctx, pi); err != nil {
		logger().Warn("mdns discovery failed", zap.String("remoteID", pi.ID.Pretty()), zap.Error(err))
	} else {
		// absorb addresses into peerstore
		ddn.host.Peerstore().AddAddrs(pi.ID, pi.Addrs, pstore.PermanentAddrTTL)
	}
}

func (ddn *driverDiscoveryNotify) Listen(net inet.Network, a ma.Multiaddr) {
	tracer := tracing.EnterFunc(ddn.rootContext, net, a)
	defer tracer.Finish()
	// ctx := tracer.Context()
}
func (ddn *driverDiscoveryNotify) ListenClose(net inet.Network, a ma.Multiaddr) {
	tracer := tracing.EnterFunc(ddn.rootContext, net, a)
	defer tracer.Finish()
	// ctx := tracer.Context()
}
func (ddn *driverDiscoveryNotify) OpenedStream(net inet.Network, s inet.Stream) {
	tracer := tracing.EnterFunc(ddn.rootContext, net, s)
	defer tracer.Finish()
	// ctx := tracer.Context()
}
func (ddn *driverDiscoveryNotify) ClosedStream(net inet.Network, s inet.Stream) {
	tracer := tracing.EnterFunc(ddn.rootContext, net, s)
	defer tracer.Finish()
	// ctx := tracer.Context()
}

func (ddn *driverDiscoveryNotify) Connected(s inet.Network, c inet.Conn) {
	tracer := tracing.EnterFunc(ddn.rootContext, s, c)
	defer tracer.Finish()
	ctx := tracer.Context()

	go func(id peer.ID) {
		ddn.muSubs.Lock()
		if len(ddn.subsStack) > 0 {
			var newSubsStack []cid.Cid
			for _, c := range ddn.subsStack {
				if err := ddn.dht.Provide(ctx, c, true); err != nil {
					// stack peer if no peer found
					logger().Warn("discover: provide err:", zap.Error(err))
					newSubsStack = append(newSubsStack, c)
				} else {
					logger().Debug("discover: announcing", zap.String("id", c.String()))
				}
			}

			ddn.subsStack = newSubsStack
		}
		ddn.muSubs.Unlock()
	}(c.RemotePeer())
}

func (ddn *driverDiscoveryNotify) Disconnected(s inet.Network, c inet.Conn) {
	tracer := tracing.EnterFunc(ddn.rootContext, s, c)
	defer tracer.Finish()
	// ctx := tracer.Context()
}
