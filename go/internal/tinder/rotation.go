package tinder

import (
	"context"
	"fmt"
	"time"

	"berty.tech/berty/v2/go/internal/rendezvous"
	"github.com/libp2p/go-libp2p-core/discovery"
	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
)

type rotation struct {
	disc discovery.Discovery
	rp   *rendezvous.RotationPoint
}

func NewRotationDiscovery(disc discovery.Discovery, rp *rendezvous.RotationPoint) discovery.Discovery {
	return &rotation{
		disc: disc,
		rp:   rp,
	}
}

func (r *rotation) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	point, err := r.rp.PointForTopic(ns)
	if err != nil {
		return 0, fmt.Errorf("unable to get rotation point for topic: %w", err)
	}

	ttl, err := r.disc.Advertise(ctx, point.RotationTopic(), opts...)
	if err != nil {
		return 0, err
	}

	if rotationTTL := point.TTL(); ttl > rotationTTL {
		ttl = point.TTL()
	}

	return ttl, nil
}

func (r *rotation) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	point, err := r.rp.PointForTopic(ns)
	if err != nil {
		c := make(chan p2p_peer.AddrInfo)
		close(c)
		return c, err
	}

	return r.disc.FindPeers(ctx, point.RotationTopic(), opts...)
}
