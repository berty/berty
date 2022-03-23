package bertyprotocol

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/tinder"
)

type Swiper struct {
	topics map[string]*pubsub.Topic

	interval time.Duration

	logger *zap.Logger
	disc   tinder.UnregisterDiscovery
}

func NewSwiper(logger *zap.Logger, disc tinder.UnregisterDiscovery, interval time.Duration) *Swiper {
	return &Swiper{
		logger:   logger.Named("swiper"),
		topics:   make(map[string]*pubsub.Topic),
		interval: interval,
		disc:     disc,
	}
}

// watchUntilDeadline looks for peers providing a resource for a given period
func (s *Swiper) watchUntilDeadline(ctx context.Context, out chan<- peer.AddrInfo, topic string, end time.Time) error {
	s.logger.Debug("start watching", logutil.PrivateString("topic", topic))

	ctx, cancel := context.WithDeadline(ctx, end)
	defer cancel()

	s.logger.Debug("start watch event handler")
	cc := s.FindPeers(ctx, topic)
	for peer := range cc {
		s.logger.Debug("swiper found peer on topic",
			logutil.PrivateString("topic", topic),
			logutil.PrivateString("peer", peer.ID.String()),
		)
		select {
		case <-ctx.Done():
			return ctx.Err()
		case out <- peer:
		}
	}

	return nil
}

// WatchTopic looks for peers providing a resource.
// 'done' is used to alert parent when everything is done, to avoid data races.
func (s *Swiper) WatchTopic(ctx context.Context, topic, seed []byte, out chan<- peer.AddrInfo, done func()) {
	defer done()
	for {
		roundedTime := rendezvous.RoundTimePeriod(time.Now(), s.interval)
		topicForTime := rendezvous.GenerateRendezvousPointForPeriod(topic, seed, roundedTime)
		periodEnd := rendezvous.NextTimePeriod(roundedTime, s.interval)
		if err := s.watchUntilDeadline(ctx, out, string(topicForTime), periodEnd); err != nil {
			s.logger.Debug("watch until deadline ended", zap.Error(err))
		}

		select {
		case <-ctx.Done():
			return
		default:
		}
	}
}

// watch looks for peers providing a resource
func (s *Swiper) Announce(ctx context.Context, topic, seed []byte) {
	var currentTopic string

	periodEnd := time.Now()
	go func() {
		for {
			if time.Now().After(periodEnd) || currentTopic == "" {
				roundedTime := rendezvous.RoundTimePeriod(time.Now(), s.interval)
				currentTopic = string(rendezvous.GenerateRendezvousPointForPeriod(topic, seed, roundedTime))
				periodEnd = rendezvous.NextTimePeriod(roundedTime, s.interval)
			}

			s.logger.Debug("self announcing")
			ttl, err := s.disc.Advertise(ctx, currentTopic)
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
			case <-time.After(time.Until(periodEnd)):
			case <-time.After(ttl):
			}
		}
	}()
}

func (s *Swiper) FindPeers(ctx context.Context, ns string) <-chan peer.AddrInfo {
	out := make(chan peer.AddrInfo)

	go func() {
		defer close(out)
		for {
			// use find peers while keeping his context
			cpeer, err := s.disc.FindPeers(ctx, ns, tinder.WatchdogDiscoverKeepContextOption)
			if err != nil {
				s.logger.Error("failed find peers", zap.String("topic", ns), zap.Error(err))
				return
			}

			for peer := range cpeer {
				select {
				case out <- peer:
				case <-ctx.Done():
					return
				}
			}

			// prevent to loop at the speed of light in case of FindPeers
			// failing to handle context/channel correctly
			<-time.After(time.Second)
		}
	}()

	return out
}
