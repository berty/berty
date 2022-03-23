package tinder

import (
	"context"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
)

type filterService struct {
	Service

	filter []string
}

func (sf *filterService) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan peer.AddrInfo, error) {
	opts = append(opts, FilterDriver(sf.filter))

	return sf.Service.FindPeers(ctx, ns, opts...)
}

func (sf *filterService) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	opts = append(opts, FilterDriver(sf.filter))

	return sf.Service.Advertise(ctx, ns, opts...)
}

func NewFilterService(service Service, filter []string) Service {
	return &filterService{
		Service: service,
		filter:  filter,
	}
}
