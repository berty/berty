package tinder

import (
	"context"
	"fmt"
	"io"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_event "github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

const TinderPeer = "Berty/TinderPeer"

const (
	DefaultFindPeerInterval     = time.Minute * 30
	DefaultAdvertiseInterval    = time.Minute
	DefaultAdvertiseGracePeriod = time.Second * 10
)

type EventMonitor int

const (
	TypeEventMonitorUnknown EventMonitor = iota
	TypeEventMonitorDriverAdvertise
	TypeEventMonitorDriverFoundPeer
	TypeEventMonitorAdvertise
	TypeEventMonitorFoundPeer
)

type EvtDriverMonitor struct {
	EventType  EventMonitor
	Topic      string
	AddrInfo   p2p_peer.AddrInfo
	DriverName string
}

type Service interface {
	UnregisterDiscovery
	io.Closer
}

type service struct {
	p2p_discovery.Discovery
	Unregisterer

	logger *zap.Logger

	nnotify *NetworkUpdate
	emitter p2p_event.Emitter
	doneCtx context.CancelFunc
}

type Opts struct {
	Logger *zap.Logger

	EnableDiscoveryMonitor bool

	AdvertiseResetInterval time.Duration
	AdvertiseGracePeriod   time.Duration
	FindPeerResetInterval  time.Duration

	// BackoffStrategy describes how backoff will be implemented on the
	// FindPeer method. If none are provided, it will be disable alongside
	// cache.
	BackoffStrategy *BackoffOpts
}

func (o *Opts) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	o.Logger = o.Logger.Named("tinder")

	if o.AdvertiseResetInterval == 0 && o.AdvertiseGracePeriod == 0 {
		o.AdvertiseResetInterval = DefaultAdvertiseInterval
		o.AdvertiseGracePeriod = DefaultAdvertiseGracePeriod
	}

	if o.FindPeerResetInterval == 0 {
		o.FindPeerResetInterval = DefaultFindPeerInterval
	}
}

func NewService(opts *Opts, h host.Host, drivers ...*Driver) (Service, error) {
	// validate opts
	opts.applyDefault()

	for _, driver := range drivers {
		if err := driver.applyDefault(); err != nil {
			return nil, fmt.Errorf("invalid driver %w", err)
		}
	}

	notify, err := NewNetworkUpdate(opts.Logger, h)
	if err != nil {
		return nil, err
	}

	// create monitor update
	emitter, err := h.EventBus().Emitter(new(EvtDriverMonitor))
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithCancel(context.Background())

	wa := newWatchdogsAdvertiser(ctx, opts.Logger, h, notify, opts.AdvertiseResetInterval, opts.AdvertiseGracePeriod, drivers)
	wd, err := newWatchdogsDiscoverer(ctx, opts.Logger, h, opts.FindPeerResetInterval, opts.BackoffStrategy, drivers)
	if err != nil {
		cancel()
		return nil, err
	}

	// compose discovery
	var disc p2p_discovery.Discovery = &DriverDiscovery{
		Advertiser: wa,
		Discoverer: wd,
	}

	// enable monitor if needed
	if opts.EnableDiscoveryMonitor {
		disc = &discoveryMonitor{
			host:    h,
			logger:  opts.Logger,
			disc:    disc,
			emitter: emitter,
		}
	}

	return &service{
		Discovery:    disc,
		Unregisterer: wa,

		logger:  opts.Logger,
		nnotify: notify,
		emitter: emitter,
		doneCtx: cancel,
	}, nil
}

func (s *service) Close() error {
	s.doneCtx()

	// we only want to log errors here, discard them on return
	if err := s.emitter.Close(); err != nil {
		s.logger.Warn("unable to close service emitter", zap.Error(err))
	}
	if err := s.nnotify.Close(); err != nil {
		s.logger.Warn("unable to close network notify", zap.Error(err))
	}

	return nil
}
