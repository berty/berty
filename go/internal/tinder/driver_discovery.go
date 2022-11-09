package tinder

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p/core/discovery"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/routing"
	disc_routing "github.com/libp2p/go-libp2p/p2p/discovery/routing"
)

type DiscoveryDriver struct {
	name string
	discovery.Discovery
}

func NewRoutingDiscoveryDriver(name string, routing routing.Routing) IDriver {
	disc := disc_routing.NewRoutingDiscovery(routing)
	return NewDiscoveryDriver(name, disc)
}

func NewDiscoveryDriver(name string, disc discovery.Discovery) IDriver {
	return &DiscoveryDriver{name, disc}
}

// discovery advertise
func (d *DiscoveryDriver) Advertise(ctx context.Context, topic string, opts ...discovery.Option) (time.Duration, error) {
	return d.Discovery.Advertise(ctx, topic, opts...)
}

// discovery find peers
func (d *DiscoveryDriver) FindPeers(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	return d.Discovery.FindPeers(ctx, topic, opts...)
}

func (d *DiscoveryDriver) Subscribe(_ context.Context, _ string, _ ...discovery.Option) (<-chan peer.AddrInfo, error) {
	return nil, ErrNotSupported
}

func (d *DiscoveryDriver) Unregister(_ context.Context, _ string, _ ...discovery.Option) error {
	return ErrNotSupported
}

func (d *DiscoveryDriver) Name() string {
	return d.name
}
