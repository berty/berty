package bertyprotocol

import (
	"context"
	"encoding/hex"
	"fmt"
	mrand "math/rand"
	"sync"
	"time"

	p2p_disc "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"go.uber.org/zap"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/rendezvous"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type swiperRequest struct {
	bstrat    discovery.BackoffStrategy
	wgRefresh *sync.WaitGroup
	ctx       context.Context
	out       chan<- peer.AddrInfo
	rdvTopic  string
}

type Swiper struct {
	topics map[string]*pubsub.Topic

	backoffFactory discovery.BackoffFactory

	inprogressLookup map[string]*swiperRequest
	muRequest        sync.Mutex

	rp *rendezvous.RotationInterval

	logger *zap.Logger
	disc   tinder.UnregisterDiscovery
}

func NewSwiper(logger *zap.Logger, disc tinder.UnregisterDiscovery, rp *rendezvous.RotationInterval) *Swiper {
	// we need to use math/rand here, but it is seeded from crypto/rand
	srand := mrand.New(mrand.NewSource(srand.MustSecure())) // nolint:gosec
	backoffstrat := discovery.NewExponentialBackoff(time.Second, time.Second*20,
		discovery.FullJitter,
		time.Second, 5.0, time.Second, srand)

	return &Swiper{
		backoffFactory:   backoffstrat,
		logger:           logger.Named("swiper"),
		topics:           make(map[string]*pubsub.Topic),
		inprogressLookup: make(map[string]*swiperRequest),
		rp:               rp,
		disc:             disc,
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
	cpeer, err := s.disc.FindPeers(req.ctx, req.rdvTopic,
		tinder.WatchdogDiscoverKeepContextOption,
		tinder.WatchdogDiscoverForceOption,
		p2p_disc.Limit(1),
	)
	if err != nil {
		err = fmt.Errorf("unable to find peers: %w", err)
		return nil, err
	}

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
		zap.String("topic", hex.EncodeToString(topic)),
		zap.String("seed", hex.EncodeToString(seed)))

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
			s.logger.Debug("looking for peers", zap.String("topic", point.RotationTopic()))
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

func (s *Swiper) watchPeers(ctx context.Context, bstrat discovery.BackoffStrategy, out chan<- peer.AddrInfo, ns string) error {
	for ctx.Err() == nil {
		s.logger.Debug("swipper looking for peers", zap.String("topic", ns))

		// wait 10 seconds before considering lookup as failed/done
		fctx, cancel := context.WithTimeout(ctx, time.Second*10)

		// use find peers while keeping his context
		// disable caching and force re-trigger each driver on call
		cpeer, err := s.disc.FindPeers(fctx, ns,
			tinder.WatchdogDiscoverKeepContextOption,
			tinder.WatchdogDiscoverForceOption,
		)
		if err != nil {
			cancel()
			return fmt.Errorf("unable to find peers: %w", err)
		}

		// forward found peers
		for peer := range cpeer {
			s.logger.Debug("found a peers", logutil.PrivateString("peer", peer.String()), logutil.PrivateString("topic", ns))
			out <- peer
		}

		cancel()

		nextDelay := bstrat.Delay()
		s.logger.Debug("swipper looking ended", zap.Duration("next_try", nextDelay))

		// wait until the context is done, or the backoff delay expired
		select {
		case <-time.After(nextDelay):
		case <-ctx.Done():
		}
	}

	s.logger.Debug("swipper looking for peers done", zap.String("topic", ns))
	return ctx.Err()
}

// watch looks for peers providing a resource
func (s *Swiper) Announce(ctx context.Context, topic, seed []byte) {
	var point *rendezvous.Point

	s.logger.Debug("start announce for peer with",
		logutil.PrivateString("topic", string(topic)),
		logutil.PrivateString("seed", string(seed)))

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
