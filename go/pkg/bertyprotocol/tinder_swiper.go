package bertyprotocol

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"io"
	"time"

	"berty.tech/berty/v2/go/internal/tinder"
	"github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

type swiper struct {
	logger   *zap.Logger
	tinder   tinder.Driver
	interval time.Duration
}

func newSwiper(t tinder.Driver, logger *zap.Logger, interval time.Duration) *swiper {
	return &swiper{
		logger:   logger,
		tinder:   t,
		interval: interval,
	}
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

// watchForPeriod looks for peers providing a resource for a given period
func (s *swiper) watchForPeriod(ctx context.Context, topic, seed []byte, t time.Time) (chan peer.AddrInfo, error) {
	out := make(chan peer.AddrInfo)

	roundedTime := roundTimePeriod(t, s.interval)
	topicForTime := generateRendezvousPointForPeriod(topic, seed, roundedTime)

	nextStart := nextTimePeriod(roundedTime, s.interval)
	ctx, cancel := context.WithDeadline(ctx, nextStart)

	ch, err := s.tinder.FindPeers(ctx, string(topicForTime))
	if err != nil {
		cancel()
		return nil, err
	}

	go func() {
		defer cancel()

		for pid := range ch {
			out <- pid
		}

		close(out)
	}()

	return out, nil
}

// watch looks for peers providing a resource
func (s *swiper) watch(ctx context.Context, topic, seed []byte) chan peer.AddrInfo {
	out := make(chan peer.AddrInfo)

	go func() {
		for {
			if ctx.Err() != nil {
				break
			}

			periodEnd := nextTimePeriod(time.Now(), s.interval)
			ctx, cancel := context.WithDeadline(ctx, periodEnd)
			ch, err := s.watchForPeriod(ctx, topic, seed, time.Now())

			if err != nil {
				s.logger.Error("unable to watch for period", zap.Error(err))
				<-ctx.Done()
			} else {
				for pid := range ch {
					out <- pid
				}
			}

			cancel()
		}

		close(out)
	}()

	return out
}

// announceForPeriod advertise a topic for a given period, will either stop when the context is done or when the period has ended
func (s *swiper) announceForPeriod(ctx context.Context, topic, seed []byte, t time.Time) (<-chan bool, <-chan error) {
	announces := make(chan bool)
	errs := make(chan error)

	roundedTime := roundTimePeriod(t, s.interval)
	topicForTime := generateRendezvousPointForPeriod(topic, seed, roundedTime)

	nextStart := nextTimePeriod(roundedTime, s.interval)

	go func() {
		ctx, cancel := context.WithDeadline(ctx, nextStart)
		defer cancel()

		defer close(errs)
		defer close(announces)
		defer func() { errs <- io.EOF }()

		for {
			duration, err := s.tinder.Advertise(ctx, string(topicForTime))
			if err != nil {
				errs <- err
				return
			}

			announces <- true

			if ctx.Err() != nil || time.Now().Add(duration).UnixNano() > nextStart.UnixNano() {
				return
			}
		}
	}()

	return announces, errs
}

// announce advertises availability on a topic indefinitely
func (s *swiper) announce(ctx context.Context, topic, seed []byte) (<-chan bool, <-chan error) {
	announces := make(chan bool)
	errs := make(chan error)

	go func() {
		defer close(announces)
		defer close(errs)
		defer func() { errs <- io.EOF }()

		for {
			select {
			case <-ctx.Done():
				return
			default:
				periodAnnounces, periodErrs := s.announceForPeriod(ctx, topic, seed, time.Now())

				select {
				case announce := <-periodAnnounces:
					announces <- announce
					break

				case err := <-periodErrs:
					errs <- err
					break
				}
			}
		}
	}()

	return announces, errs
}
