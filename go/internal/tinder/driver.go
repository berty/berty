package tinder

import (
	"context"
	"fmt"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
	routing "github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	bhost "github.com/libp2p/go-libp2p/p2p/host/basic"
	ma "github.com/multiformats/go-multiaddr"
)

// Driver is a p2p_discovery.Discovery
var _ p2p_discovery.Discovery = (UnregisterDiscovery)(nil)

type Unregisterer interface {
	Unregister(ctx context.Context, ns string) error
}

// Driver is a Discovery with a unregister method
type UnregisterDiscovery interface {
	p2p_discovery.Discovery
	Unregisterer
}

type DriverDiscovery struct {
	p2p_discovery.Discoverer
	p2p_discovery.Advertiser
}

type Driver struct {
	Name         string
	AddrsFactory bhost.AddrsFactory

	Unregisterer
	p2p_discovery.Discovery
}

func (d *Driver) applyDefault() error {
	if d.Name == "" {
		return fmt.Errorf("no `Name` was provided")
	}

	if d.Discovery == nil {
		d.Discovery = NoopDiscovery
	}

	if d.Unregisterer == nil {
		d.Unregisterer = NoopUnregisterer
	}

	if d.AddrsFactory == nil {
		d.AddrsFactory = NoopAddrsFactory
	}

	return nil
}

func NewDriverFromDiscovery(name string, disc p2p_discovery.Discovery, factory bhost.AddrsFactory) *Driver {
	return &Driver{
		Name:         name,
		Discovery:    disc,
		AddrsFactory: factory,
	}
}

func NewDriverFromUnregisterDiscovery(name string, udisc UnregisterDiscovery, factory bhost.AddrsFactory) *Driver {
	return &Driver{
		Name:         name,
		Discovery:    udisc,
		Unregisterer: udisc,
		AddrsFactory: factory,
	}
}

func NewDriverFromRouting(name string, routing routing.ContentRouting, factory bhost.AddrsFactory) *Driver {
	disc := discovery.NewRoutingDiscovery(routing)
	return &Driver{
		Name:         name,
		Discovery:    disc,
		AddrsFactory: factory,
	}
}

func NoopAddrsFactory(addrs []ma.Multiaddr) []ma.Multiaddr { return addrs }

var NoopUnregisterer Unregisterer = &noopUnregisterer{}

type noopUnregisterer struct{}

func (*noopUnregisterer) Unregister(context.Context, string) error { return nil }

var NoopDiscovery p2p_discovery.Discovery = &noopDiscovery{}

type noopDiscovery struct{}

func (*noopDiscovery) Advertise(context.Context, string, ...p2p_discovery.Option) (time.Duration, error) {
	return 0, nil
}

func (*noopDiscovery) FindPeers(context.Context, string, ...p2p_discovery.Option) (<-chan peer.AddrInfo, error) {
	cc := make(chan peer.AddrInfo)
	close(cc)
	return cc, nil
}
