package tinder

import (
	"context"
	"sync"
	"time"

	"github.com/libp2p/go-libp2p/core/discovery"
	"github.com/libp2p/go-libp2p/core/peer"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

var _ discovery.Discovery = (*DiscoveryAdaptater)(nil)

type discoverySubscribtion struct {
	sub   *Subscription
	timer *time.Timer
}

type DiscoveryAdaptater struct {
	ctx         context.Context
	cancel      context.CancelFunc
	logger      *zap.Logger
	defaultOpts []Option

	service *Service

	// watchdogDiscover
	watchdogDiscover map[string]*discoverySubscribtion
	muDiscover       sync.Mutex

	// advertise
	watchdogAdvertise map[string]*time.Timer
	muAdvertiser      sync.Mutex
	resetInterval     time.Duration
	ttl               time.Duration

	closeOnce sync.Once
}

func NewDiscoveryAdaptater(logger *zap.Logger, service *Service, defaultOpts ...Option) *DiscoveryAdaptater {
	ctx, cancel := context.WithCancel(context.Background())
	return &DiscoveryAdaptater{
		ctx:               ctx,
		cancel:            cancel,
		logger:            logger.Named("disc"),
		watchdogDiscover:  make(map[string]*discoverySubscribtion),
		watchdogAdvertise: make(map[string]*time.Timer),
		service:           service,
		resetInterval:     time.Minute * 10,
		ttl:               time.Minute * 5,
		defaultOpts:       defaultOpts,
	}
}

func (a *DiscoveryAdaptater) FindPeers(ctx context.Context, topic string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	a.muDiscover.Lock()
	defer a.muDiscover.Unlock()

	if st, ok := a.watchdogDiscover[topic]; ok {
		// already running FindPeers, reset watchdog
		if !st.timer.Stop() {
			<-st.timer.C
		}
		st.timer.Reset(a.resetInterval)

		// watch again for new peers until the method expire
		return st.sub.Out(), nil
	}

	start := time.Now()
	a.logger.Debug("watchdogs looking for peers", logutil.PrivateString("topic", topic))

	// filter out local discovery
	sub := a.service.Subscribe(topic, a.defaultOpts...)
	// pull to fetch previous peers (FindPeers)
	go func() {
		if err := sub.Pull(); err != nil {
			a.logger.Error("unable to pull topic", zap.String("topic", topic), zap.Error(err))
		}
	}()

	// create a new watchdog
	timer := time.AfterFunc(a.resetInterval, func() {
		a.logger.Debug("findpeers expired",
			logutil.PrivateString("topic", topic),
			zap.Duration("duration", time.Since(start)))

		// watchdog has expired, cancel lookup+topic_watcher
		a.muDiscover.Lock()
		sub.Close()
		delete(a.watchdogDiscover, topic)
		a.muDiscover.Unlock()
	})

	a.watchdogDiscover[topic] = &discoverySubscribtion{
		timer: timer,
		sub:   sub,
	}

	// watch for new peers until method context expire
	return sub.Out(), nil
}

func (a *DiscoveryAdaptater) Advertise(_ context.Context, topic string, opts ...discovery.Option) (time.Duration, error) {
	ctx := a.ctx

	a.muAdvertiser.Lock()
	defer a.muAdvertiser.Unlock()

	start := time.Now()
	if t, ok := a.watchdogAdvertise[topic]; ok {
		// if we already advertise on this topic, reset the watchdog
		if !t.Stop() {
			<-t.C
		}
		t.Reset(a.resetInterval)
	} else {
		wctx, cancel := context.WithCancel(ctx)

		// start advertising on this topic
		// filter out local discovery
		if err := a.service.StartAdvertises(wctx, topic, a.defaultOpts...); err != nil {
			a.logger.Error("advertise failed", logutil.PrivateString("topic", topic), zap.Error(err))
			cancel()
			return time.Minute, err
		}

		a.logger.Debug("advertise started", logutil.PrivateString("topic", topic))

		// create a new watchdog
		a.watchdogAdvertise[topic] = time.AfterFunc(a.resetInterval, func() {
			// watchdog has expired, cancel advertise

			a.muAdvertiser.Lock()
			cancel()
			a.logger.Debug("advertise expired",
				logutil.PrivateString("topic", topic),
				zap.Duration("duration", time.Since(start)),
			)

			delete(a.watchdogAdvertise, topic)
			a.muAdvertiser.Unlock()

			// unregister from this topic if possible
			if err := a.service.Unregister(ctx, topic); err != nil {
				a.logger.Debug("unregister failed",
					logutil.PrivateString("topic", topic),
					zap.Error(err),
				)
			}
		})
	}

	return a.ttl, nil
}

func (a *DiscoveryAdaptater) Close() error {
	a.closeOnce.Do(func() {
		a.muDiscover.Lock()
		a.cancel()
		for _, st := range a.watchdogDiscover {
			if !st.timer.Stop() {
				<-st.timer.C
			}
			_ = st.sub.Close()
		}
		a.muDiscover.Unlock()

		a.muAdvertiser.Lock()
		for _, t := range a.watchdogAdvertise {
			if !t.Stop() {
				<-t.C
			}
		}
		a.muAdvertiser.Unlock()
	})

	return nil
}
