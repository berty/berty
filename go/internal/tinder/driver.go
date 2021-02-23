package tinder

import (
	"context"
	"fmt"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
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

type Driver struct {
	Name         string
	AddrsFactory bhost.AddrsFactory

	Unregisterer
	p2p_discovery.Discovery
}

func (d *Driver) applyDefault() error {
	if d.Name == "" {
		return fmt.Errorf("no driver `Name` was provided")
	}

	if d.Discovery == nil {
		return fmt.Errorf("cannot create a tinder driver without a discovery")
	}

	if d.Unregisterer == nil {
		d.Unregisterer = NoopUnregisterer
	}

	if d.AddrsFactory == nil {
		d.AddrsFactory = NoopAddrsFactory
	}

	return nil
}

func NoopAddrsFactory([]ma.Multiaddr) (a []ma.Multiaddr) { return }

var NoopUnregisterer Unregisterer = &noopUnregisterer{}

type noopUnregisterer struct{}

func (*noopUnregisterer) Unregister(context.Context, string) error { return nil }

func ComposeDriver(name string, advertiser p2p_discovery.Advertiser, discover p2p_discovery.Discoverer, unregister Unregisterer) UnregisterDiscovery {
	return nil
}
