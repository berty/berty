package bertyprotocol

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p-core/peer"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"
)

type Swiper struct {
	muTopics sync.Mutex
	topics   map[string]*pubsub.Topic

	interval time.Duration

	logger *zap.Logger
	pubsub *pubsub.PubSub
}

func NewSwiper(logger *zap.Logger, ps *pubsub.PubSub, interval time.Duration) *Swiper {
	return &Swiper{
		logger:   logger,
		pubsub:   ps,
		topics:   make(map[string]*pubsub.Topic),
		interval: interval,
	}
}

func (s *Swiper) topicJoin(topic string, opts ...pubsub.TopicOpt) (*pubsub.Topic, error) {
	s.muTopics.Lock()
	defer s.muTopics.Unlock()

	var err error

	t, ok := s.topics[topic]
	if ok {
		return t, nil
	}

	if t, err = s.pubsub.Join(topic, opts...); err != nil {
		return nil, err
	}

	if _, err = t.Relay(); err != nil {
		t.Close()
		return nil, err
	}

	s.topics[topic] = t
	return t, nil
}

func (s *Swiper) topicLeave(topic string) (err error) {
	s.muTopics.Lock()
	if t, ok := s.topics[topic]; ok {
		err = t.Close()
		delete(s.topics, topic)
	}
	s.muTopics.Unlock()
	return
}

// watchUntilDeadline looks for peers providing a resource for a given period
func (s *Swiper) watchUntilDeadline(ctx context.Context, out chan<- peer.AddrInfo, topic string, end time.Time) error {
	s.logger.Debug("start watching", zap.String("topic", topic))
	tp, err := s.topicJoin(topic)
	if err != nil {
		return err
	}

	te, err := tp.EventHandler()
	if err != nil {
		return err
	}

	ctx, cancel := context.WithDeadline(ctx, end)
	defer cancel()
	defer func() {
		if err := s.topicLeave(topic); err != nil {
			s.logger.Debug("unable to leave topic properly", zap.Error(err))
		}
	}()

	s.logger.Debug("start watch event handler")
	for {
		pe, _ := te.NextPeerEvent(ctx)
		if ctx.Err() != nil {
			return ctx.Err()
		}

		s.logger.Debug("event received")
		switch pe.Type {
		case pubsub.PeerJoin:
			s.logger.Debug("peer joined topic",
				zap.String("topic", topic),
				zap.String("peer", pe.Peer.ShortString()),
			)
			select {
			case <-ctx.Done():
				return ctx.Err()
			case out <- peer.AddrInfo{ID: pe.Peer}:
			}
		case pubsub.PeerLeave:
		}
	}
}

// WatchTopic looks for peers providing a resource.
// 'done' is used to alert parent when everything is done, to avoid data races.
func (s *Swiper) WatchTopic(ctx context.Context, topic, seed []byte, out chan<- peer.AddrInfo, done func()) {
	defer done()
	for {
		roundedTime := roundTimePeriod(time.Now(), s.interval)
		topicForTime := generateRendezvousPointForPeriod(topic, seed, roundedTime)
		periodEnd := nextTimePeriod(roundedTime, s.interval)
		err := s.watchUntilDeadline(ctx, out, string(topicForTime), periodEnd)
		switch err {
		case nil:
		case context.DeadlineExceeded, context.Canceled:
			s.logger.Debug("watch until deadline", zap.Error(err))
		default:
			s.logger.Error("watch until deadline", zap.Error(err))
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
	s.logger.Debug("start watch announce")

	go func() {
		ctx, cancel := context.WithCancel(ctx)
		defer cancel()

		for {
			if currentTopic != "" {
				if err := s.topicLeave(currentTopic); err != nil {
					s.logger.Warn("failed to start close current topic", zap.Error(err))
				}
			}

			roundedTime := roundTimePeriod(time.Now(), s.interval)
			currentTopic = string(generateRendezvousPointForPeriod(topic, seed, roundedTime))
			_, err := s.topicJoin(currentTopic)
			if err != nil {
				s.logger.Error("failed to announce topic", zap.Error(err))
				return
			}

			periodEnd := nextTimePeriod(roundedTime, s.interval)
			select {
			case <-ctx.Done():
				return
			case <-time.After(time.Until(periodEnd)):
			}
		}
	}()
}

func roundTimePeriod(date time.Time, interval time.Duration) time.Time {
	if interval < 0 {
		interval = -interval
	}

	intervalSeconds := int64(interval.Seconds())

	periodsElapsed := date.Unix() / intervalSeconds
	totalTime := periodsElapsed * intervalSeconds

	return time.Unix(totalTime, 0).In(date.Location())
}

func nextTimePeriod(date time.Time, interval time.Duration) time.Time {
	if interval < 0 {
		interval = -interval
	}

	return roundTimePeriod(date, interval).Add(interval)
}

func generateRendezvousPointForPeriod(topic, seed []byte, date time.Time) []byte {
	buf := make([]byte, 8)
	mac := hmac.New(sha256.New, append(topic, seed...))
	binary.BigEndian.PutUint64(buf, uint64(date.Unix()))

	_, err := mac.Write(buf)
	if err != nil {
		panic(err)
	}
	sum := mac.Sum(nil)

	return sum
}
