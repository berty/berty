package bertyprotocol

import (
	"context"
	"encoding/hex"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/tinder"
)

type Swiper struct {
	topics map[string]*pubsub.Topic

	rp *rendezvous.RotationInterval

	logger *zap.Logger
	disc   tinder.UnregisterDiscovery
}

func NewSwiper(logger *zap.Logger, disc tinder.UnregisterDiscovery, rp *rendezvous.RotationInterval) *Swiper {
	return &Swiper{
		logger: logger.Named("swiper"),
		topics: make(map[string]*pubsub.Topic),
		rp:     rp,
		disc:   disc,
	}
}

// WatchTopic looks for peers providing a resource.
// 'done' is used to alert parent when everything is done, to avoid data races.
func (s *Swiper) WatchTopic(ctx context.Context, topic, seed []byte, out chan<- peer.AddrInfo, done func()) {
	s.logger.Debug("start watch for peer with",
		zap.String("topic", hex.EncodeToString(topic)),
		zap.String("seed", hex.EncodeToString(seed)))

	defer done()
	for {
		point := s.rp.NewRendezvousPointForPeriod(time.Now(), string(topic), seed)
		s.logger.Debug("watch topic for time", zap.Duration("ttl", point.TTL()), zap.String("topic", point.RotationTopic()))

		watchCtx, cancel := context.WithDeadline(ctx, point.Deadline())
		if err := s.watchPeers(watchCtx, out, point.RotationTopic()); err != nil && err != context.DeadlineExceeded {
			s.logger.Debug("watch until deadline ended", zap.Error(err))
		}
		cancel()

		select {
		case <-ctx.Done():
			return
		default:
		}
	}
}

// watch looks for peers providing a resource
func (s *Swiper) Announce(ctx context.Context, topic, seed []byte) {
	var point *rendezvous.Point

	s.logger.Debug("start announce for peer with",
		zap.String("topic", hex.EncodeToString(topic)),
		zap.String("seed", hex.EncodeToString(seed)))

	go func() {
		for {
			if point == nil || time.Now().After(point.Deadline()) {
				point = s.rp.NewRendezvousPointForPeriod(time.Now(), string(topic), seed)
			}

			s.logger.Debug("self announce topic for time", zap.String("topic", point.RotationTopic()))
			ttl, err := s.disc.Advertise(ctx, point.RotationTopic())
			switch err {
			case context.Canceled, context.DeadlineExceeded:
				return
			case nil:
				// if no error and no ttl is set, wait 1 minutes before retrying
				if ttl == 0 {
					ttl = time.Minute
				}
			default:
				s.logger.Error("failed to announce topic", zap.Error(err))
				if ttl == 0 {
					// if no ttl is set, wait 10 seconds before retrying
					ttl = time.Second * 10
				}
			}

			select {
			case <-ctx.Done():
				return
			case <-time.After(point.TTL()):
			case <-time.After(ttl):
			}

			time.Sleep(time.Second)
		}
	}()
}

func (s *Swiper) watchPeers(ctx context.Context, out chan<- peer.AddrInfo, ns string) error {
	s.logger.Debug("swipper looking for peers", zap.String("topic", ns))

	for {
		// use find peers while keeping his context
		cpeer, err := s.disc.FindPeers(ctx, ns)
		if err != nil {
			s.logger.Error("failed find peers", zap.String("topic", ns), zap.Error(err))
		}

		for peer := range cpeer {
			select {
			case out <- peer:
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		// prevent to loop at the speed of light in case of FindPeers
		// failing to handle context/channel correctly
		<-time.After(time.Second * 10)
	}
}
