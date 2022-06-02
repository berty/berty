package tinder

import (
	"context"
	"fmt"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/rendezvous"
)

type rotation struct {
	logger *zap.Logger
	disc   discovery.Discovery
	rp     *rendezvous.RotationInterval
}

func NewRotationDiscovery(logger *zap.Logger, disc discovery.Discovery, rp *rendezvous.RotationInterval) discovery.Discovery {
	return &rotation{
		logger: logger,
		disc:   disc,
		rp:     rp,
	}
}

func (r *rotation) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	point, err := r.rp.PointForTopic(ns)
	if err != nil {
		r.logger.Error("advertise: unable to get point for topic", zap.Error(err))
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

func (r *rotation) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	point, err := r.rp.PointForTopic(ns)
	if err != nil {
		c := make(chan p2p_peer.AddrInfo)
		close(c)
		r.logger.Error("FindPeer: unable to get point for topic", zap.Error(err))
		return c, err
	}

	return r.disc.FindPeers(ctx, point.RotationTopic(), opts...)
}
