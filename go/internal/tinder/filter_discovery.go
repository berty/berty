package tinder

import (
	"context"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
)

type filterDiscovery struct {
	disc   p2p_discovery.Discovery
	filter []string
}

func (sf *filterDiscovery) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan peer.AddrInfo, error) {
	opts = append(opts, FilterDriverNameOption(sf.filter...))

	return sf.disc.FindPeers(ctx, ns, opts...)
}

func (sf *filterDiscovery) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	opts = append(opts, FilterDriverNameOption(sf.filter...))

	return sf.disc.Advertise(ctx, ns, opts...)
}

func NewFilterDriverDiscovery(disc p2p_discovery.Discovery, filters ...string) p2p_discovery.Discovery {
	return &filterDiscovery{
		disc:   disc,
		filter: filters,
	}
}
