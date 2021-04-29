package tinder

import (
	"context"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_event "github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

// discovery monitor will send a event everytime we found/advertise a peer
type discoveryMonitor struct {
	host    host.Host
	logger  *zap.Logger
	disc    p2p_discovery.Discovery
	emitter p2p_event.Emitter
}

// Advertise advertises a service
func (d *discoveryMonitor) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	ttl, err := d.disc.Advertise(ctx, ns, opts...)
	if err == nil {
		d.Emit(&EvtDriverMonitor{
			EventType: TypeEventMonitorAdvertise,
			AddrInfo: p2p_peer.AddrInfo{
				ID:    d.host.ID(),
				Addrs: d.host.Addrs(),
			},
			Topic: ns,
		})
	}

	return ttl, err
}

// FindPeers discovers peers providing a service
func (d *discoveryMonitor) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	c, err := d.disc.FindPeers(ctx, ns, opts...)
	if err != nil {
		return nil, err
	}

	retc := make(chan p2p_peer.AddrInfo)
	go func() {
		for p := range c {
			d.Emit(&EvtDriverMonitor{
				EventType: TypeEventMonitorFoundPeer,
				AddrInfo:  p,
				Topic:     ns,
			})
			retc <- p
		}

		close(retc)
	}()

	return retc, err
}

func (d *discoveryMonitor) Emit(evt *EvtDriverMonitor) {
	if err := d.emitter.Emit(*evt); err != nil {
		d.logger.Warn("unable to emit `EvtDriverMonitor`", zap.Error(err))
	}
}
