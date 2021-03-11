package tinder

import (
	"context"
	"fmt"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
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
