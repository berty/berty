package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"
	mrand "math/rand"
	"sync"
	"time"

	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/peer"
	backoff "github.com/libp2p/go-libp2p/p2p/discovery/backoff"
	"go.uber.org/zap"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	tinder "berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type swiperRequest struct {
	bstrat    backoff.BackoffStrategy
	wgRefresh *sync.WaitGroup
	ctx       context.Context
	out       chan<- peer.AddrInfo
	rdvTopic  string
}

type Swiper struct {
	topics map[string]*pubsub.Topic

	backoffFactory backoff.BackoffFactory

	inprogressLookup map[string]*swiperRequest
	muRequest        sync.Mutex

	rp *rendezvous.RotationInterval

	logger *zap.Logger
	tinder *tinder.Service
}

func NewSwiper(logger *zap.Logger, tinder *tinder.Service, rp *rendezvous.RotationInterval) *Swiper {
	// we need to use math/rand here, but it is seeded from crypto/rand
	srand := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec
	backoffstrat := backoff.NewExponentialBackoff(time.Second, time.Minute*10,
		backoff.FullJitter,
		time.Second, 30.0, 0, srand)

	return &Swiper{
		backoffFactory:   backoffstrat,
		logger:           logger.Named("swiper"),
		topics:           make(map[string]*pubsub.Topic),
		inprogressLookup: make(map[string]*swiperRequest),
		rp:               rp,
		tinder:           tinder,
	}
}

func (s *Swiper) RefreshContactRequest(ctx context.Context, topic []byte) (addrs []peer.AddrInfo, err error) {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "swiper starting refresh: "+hex.EncodeToString(topic))
	defer func() {
		endSection(err, "")
	}()

	// canceling find peers
	s.muRequest.Lock()
	req, ok := s.inprogressLookup[string(topic)]
	if !ok {
		err = fmt.Errorf("unknown topic")
		s.muRequest.Unlock()
		return
	}

	// add a refresh job process
	req.wgRefresh.Add(1)
	defer req.wgRefresh.Done()

	s.muRequest.Unlock()

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	go func() {
		// if rotation topic is outdated, cancel research
		<-req.ctx.Done()
		cancel()
	}()

	// force find peers re check topic
	cpeer := s.tinder.FindPeers(req.ctx, req.rdvTopic)
	select {
	case p := <-cpeer:
		req.out <- p
		return []peer.AddrInfo{p}, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

// WatchTopic looks for peers providing a resource.
// 'done' is used to alert parent when everything is done, to avoid data races.
func (s *Swiper) WatchTopic(ctx context.Context, topic, seed []byte) <-chan peer.AddrInfo {
	ctx, _, endSection := tyber.Section(ctx, s.logger, "swiper looking for peers: "+hex.EncodeToString(topic))

	s.muRequest.Lock()
	defer s.muRequest.Unlock()

	s.logger.Debug("start watch for peer with",
		logutil.PrivateString("topic", string(topic)),
		zap.String("seed", string(seed)))

	var point *rendezvous.Point

	cpeers := make(chan peer.AddrInfo)

	go func() {
		defer endSection(nil, "watch topic ended")
		defer close(cpeers)

		wgRefresh := sync.WaitGroup{}

		for ctx.Err() == nil {
			if point == nil || time.Now().After(point.Deadline()) {
				point = s.rp.NewRendezvousPointForPeriod(time.Now(), string(topic), seed)
			}

			bstrat := s.backoffFactory()

			// store watch peers informations to be later use by the refresh method to force a lookup
			s.muRequest.Lock()
			wctx, cancel := context.WithCancel(ctx)
			s.inprogressLookup[string(topic)] = &swiperRequest{
				bstrat:    bstrat,
				wgRefresh: &wgRefresh,
				ctx:       wctx,
				out:       cpeers,
				rdvTopic:  point.RotationTopic(),
			}
			s.muRequest.Unlock()

			// start looking for peers for the given rotation topic
			s.logger.Debug("looking for peers", logutil.PrivateString("topic", point.RotationTopic()))
			if err := s.watchPeers(wctx, bstrat, cpeers, point.RotationTopic()); err != nil && err != context.DeadlineExceeded {
				s.logger.Debug("watch until deadline ended", zap.Error(err))
			}
			cancel()

			// at this point upper context is done or we need to refresh
			// rotation point.
			// take a little breath and wait one second to avoid calling find
			// peer in short amount of time
			time.Sleep(time.Second)
		}

		s.muRequest.Lock()
		delete(s.inprogressLookup, string(topic))
		s.muRequest.Unlock()

		// wait all refresh job are done before closing the channel
		// we dont want to send peer on a closed channel
		wgRefresh.Wait()
	}()

	return cpeers
}

func (s *Swiper) watchPeers(ctx context.Context, _ backoff.BackoffStrategy, out chan<- peer.AddrInfo, topic string) error {
	sub := s.tinder.Subscribe(topic)
	defer sub.Close()
	// func () {
	// 	if err := sub.Close(); err != nil {
	// 		s.logger.Error("unable to close sub properly", zap.Error(err))
	// 	}
	// }()

	s.logger.Debug("swipper watch peers started", logutil.PrivateString("topic", topic))

	// start findpeers for pulls
	go func() {
		timeout := time.Minute // @TODO(gfanton): do we need to use backoffstartegy here ?
		for ctx.Err() == nil {
			s.logger.Debug("swiper pulling for peers", logutil.PrivateString("topic", topic))
			if err := sub.Pull(); err != nil {
				s.logger.Error("unable to pull for peer on subscription", zap.Error(err))
			}

			select {
			case <-time.After(timeout):
			case <-ctx.Done():
			}
		}
	}()

	for {
		// wait until the context is done
		select {
		case p := <-sub.Out():
			s.logger.Debug("found a peers", logutil.PrivateString("topic", topic), zap.String("peer", p.String()))
			out <- p
		case <-ctx.Done():
			s.logger.Debug("watch peers done", logutil.PrivateString("topic", topic))
			return ctx.Err()
		}
	}
}

// watch looks for peers providing a resource
func (s *Swiper) Announce(ctx context.Context, topic, seed []byte) {
	var point *rendezvous.Point

	s.logger.Debug("start announce for peer with",
		logutil.PrivateString("topic", string(topic)),
		logutil.PrivateString("seed", string(seed)))

	go func() {
		for ctx.Err() == nil {
			if point == nil || time.Now().After(point.Deadline()) {
				point = s.rp.NewRendezvousPointForPeriod(time.Now(), string(topic), seed)
			}

			s.logger.Debug("self announce topic for time", logutil.PrivateString("topic", point.RotationTopic()))

			actx, cancel := context.WithDeadline(ctx, point.Deadline())
			if err := s.tinder.StartAdvertises(actx, point.RotationTopic()); err != nil && err != ctx.Err() {
				cancel()
				<-time.After(time.Second * 10) // retry after 10sc
				continue
			}

			select {
			case <-actx.Done():
				s.logger.Debug("rotation ended", logutil.PrivateString("topic", point.RotationTopic()))
			case <-ctx.Done():
				s.logger.Debug("announce advertise ended", logutil.PrivateString("topic", point.RotationTopic()), zap.Error(ctx.Err()))
			}

			cancel()
		}
	}()
}
