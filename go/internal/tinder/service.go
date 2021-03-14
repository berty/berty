package tinder

import (
	"context"
	fmt "fmt"
	"io"
	"reflect"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_event "github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"

	discovery "github.com/libp2p/go-libp2p-discovery"
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
	drivers []*Driver
	logger  *zap.Logger

	emitter       p2p_event.Emitter
	host          host.Host
	networkNotify *NetworkUpdate
	resetInterval time.Duration
	ttl           time.Duration
	watchdogs     map[string]*time.Timer
	muAdvertiser  sync.Mutex
}

type Opts struct {
	Logger *zap.Logger

	FindPeerResetInterval  time.Duration
	AdvertiseResetInterval time.Duration
	AdvertiseGracePeriod   time.Duration
	BackoffStratFactory    discovery.BackoffFactory
	DiscovertyOptions      []discovery.BackoffDiscoveryOption
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

	// create tinder service
	s, err := newService(opts, h, drivers...)
	if err != nil {
		return nil, err
	}

	// add backoff strategy if provided
	var disc p2p_discovery.Discovery
	if opts.BackoffStratFactory != nil {
		// wrap backoff/cache discovery
		disc, err = discovery.NewBackoffDiscovery(s, opts.BackoffStratFactory, opts.DiscovertyOptions...)
		if err != nil {
			return nil, err
		}
	} else {
		disc = s
	}

	// disc = s

	discm := &discoveryMonitor{
		host:    h,
		logger:  opts.Logger,
		disc:    disc,
		emitter: s.emitter,
	}

	// compose backoff with tinder service
	var composer struct {
		p2p_discovery.Discoverer
		p2p_discovery.Advertiser
		Unregisterer
		io.Closer
	}

	wctx, cancel := context.WithCancel(context.Background())

	composer.Advertiser = discm
	composer.Discoverer = newWatchdogsDiscoverer(wctx, opts.Logger, opts.AdvertiseResetInterval, discm)
	composer.Unregisterer = s
	composer.Closer = newCloserCompose(func() error {
		cancel()
		return s.Close()
	})

	return &composer, nil
}

type closerCompose struct {
	closer func() error
}

func newCloserCompose(closer func() error) io.Closer {
	return &closerCompose{closer}
}
func (c *closerCompose) Close() error { return c.closer() }

func newService(opts *Opts, h host.Host, drivers ...*Driver) (*service, error) {
	nn, err := NewNetworkUpdate(opts.Logger, h)
	if err != nil {
		return nil, err
	}

	// create monitor update
	emitter, err := h.EventBus().Emitter(new(EvtDriverMonitor))
	if err != nil {
		return nil, err
	}

	s := &service{
		watchdogs:     make(map[string]*time.Timer),
		emitter:       emitter,
		host:          h,
		networkNotify: nn,
		drivers:       drivers,
		logger:        opts.Logger,
		ttl:           opts.AdvertiseResetInterval,
		resetInterval: opts.AdvertiseResetInterval + opts.AdvertiseGracePeriod,
	}

	return s, nil
}

func (s *service) ProtectPeer(id p2p_peer.ID) {
	s.host.ConnManager().Protect(id, TinderPeer)
}

func (s *service) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	if len(s.drivers) == 0 {
		return 0, fmt.Errorf("no drivers to advertise")
	}

	s.muAdvertiser.Lock()

	timer := time.Now()
	if t, ok := s.watchdogs[ns]; ok {
		if !t.Stop() {
			<-t.C
		}

		t.Reset(s.resetInterval)
	} else {
		ctx, cancel := context.WithCancel(ctx)
		s.watchdogs[ns] = time.AfterFunc(s.resetInterval, func() {
			cancel()
			s.logger.Debug("advertise expired",
				zap.String("ns", ns),
				zap.Duration("duration", time.Since(timer)),
			)

			s.muAdvertiser.Lock()
			delete(s.watchdogs, ns)
			s.muAdvertiser.Unlock()

			// unregister drivers, dont use canceled context
			s.unregister(context.Background(), ns)
		})
		s.advertises(ctx, ns, opts...)
	}

	s.muAdvertiser.Unlock()

	s.logger.Debug("advertise started", zap.String("ns", ns))
	return s.ttl, nil
}

func (s *service) unregister(ctx context.Context, ns string) {
	for _, driver := range s.drivers {
		if err := driver.Unregister(ctx, ns); err != nil {
			s.logger.Warn("unable to unsubscribe", zap.Error(err))
		}
	}
}

func (s *service) advertises(ctx context.Context, ns string, opts ...p2p_discovery.Option) {
	for _, d := range s.drivers {
		go s.advertise(ctx, d, ns, opts...)
	}
}

func (s *service) advertise(ctx context.Context, d *Driver, ns string, opts ...p2p_discovery.Option) {
	for {
		currentAddrs := s.networkNotify.GetLastUpdatedAddrs(ctx)
		now := time.Now()
		ttl, err := d.Advertise(ctx, ns, opts...)
		took := time.Since(now)

		var deadline time.Duration

		if err != nil {
			s.logger.Warn("unable to advertise",
				zap.String("driver", d.Name),
				zap.String("ns", ns), zap.Error(err))
			select {
			case <-ctx.Done():
				return
			default:
			}

			deadline = s.resetInterval
		} else {
			s.Emit(&EvtDriverMonitor{
				EventType: TypeEventMonitorDriverAdvertise,
				AddrInfo: p2p_peer.AddrInfo{
					ID:    s.host.ID(),
					Addrs: currentAddrs,
				},
				Topic:      ns,
				DriverName: d.Name,
			})

			if ttl == 0 {
				ttl = s.ttl
			}
			deadline = 4 * ttl / 5
		}

		s.logger.Debug("advertise",
			zap.String("driver", d.Name),
			zap.String("ns", ns),
			zap.Duration("ttl", ttl),
			zap.Duration("took", took),
			zap.Duration("next", deadline),
		)

		waitctx, cancel := context.WithTimeout(ctx, deadline)
		ok := s.networkNotify.WaitForUpdate(waitctx, currentAddrs, d.AddrsFactory)
		cancel()

		if !ok {
			select {
			// check for parent ctx
			case <-ctx.Done():
				return
			default:
			}
		}
	}
}

type driverChan struct {
	driver *Driver
	cc     <-chan p2p_peer.AddrInfo
	topic  string
}

func (s *service) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	s.logger.Debug("find peers started", zap.String("key", ns), zap.Int("drivers", len(s.drivers)))

	cc := make(chan p2p_peer.AddrInfo)
	if len(s.drivers) == 0 {
		close(cc)
		return cc, nil
	}

	ctx, cancel := context.WithCancel(ctx)
	cdrivers := []*driverChan{}
	for _, driver := range s.drivers {
		ch, err := driver.FindPeers(ctx, ns, opts...)
		if err != nil {
			s.logger.Warn("failed to run find peers",
				zap.String("driver", driver.Name),
				zap.String("key", ns),
				zap.Error(err))

			continue
		}

		s.logger.Debug("finder driver started", zap.String("key", ns), zap.String("driver", driver.Name))

		cdrivers = append(cdrivers, &driverChan{
			cc:     ch,
			driver: driver,
			topic:  ns,
		})
	}

	go func() {
		defer cancel()
		defer close(cc)

		// use optimized method for few drivers
		err := s.selectFindPeers(ctx, cc, cdrivers)
		s.logger.Warn("find peers done", zap.String("topic", ns), zap.Error(err))
	}()

	return cc, nil
}

func (s *service) selectFindPeers(ctx context.Context, out chan<- p2p_peer.AddrInfo, in []*driverChan) error {
	nsels := len(in) + 1 // number of drivers + context
	selDone := nsels - 1 // context index
	selCases := make([]reflect.SelectCase, nsels)

	for i, driver := range in {
		selCases[i] = reflect.SelectCase{
			Dir:  reflect.SelectRecv,
			Chan: reflect.ValueOf(driver.cc),
		}
	}

	selCases[selDone] = reflect.SelectCase{
		Dir:  reflect.SelectRecv,
		Chan: reflect.ValueOf(ctx.Done()),
	}

	n := len(selCases) - 1 // ignore context selector
	for n > 0 {
		sel, value, ok := reflect.Select(selCases)
		if sel == selDone {
			s.logger.Warn("context done")
			return ctx.Err()
		}

		if !ok {
			// The chosen channel has been closed, so zero out the channel to disable the case
			selCases[sel].Chan = reflect.ValueOf(nil)
			n--
			continue
		}

		driver := in[sel].driver
		topic := in[sel].topic
		// we can safly get our peer
		peer := value.Interface().(p2p_peer.AddrInfo)

		// skip self id if found
		if peer.ID == s.host.ID() {
			continue
		}

		// @gfanton(TODO): filter addrs by drivers should be made
		// directly on the advertiser side, but since most drivers take
		// addrs directly from host, it's easier (for now) to filter it
		// here
		if addrs := driver.AddrsFactory(peer.Addrs); len(addrs) > 0 {
			filterpeer := p2p_peer.AddrInfo{
				ID:    peer.ID,
				Addrs: addrs,
			}

			// protect this peer to avoid to be pruned
			s.ProtectPeer(peer.ID)

			s.Emit(&EvtDriverMonitor{
				EventType:  TypeEventMonitorDriverFoundPeer,
				Topic:      topic,
				AddrInfo:   filterpeer,
				DriverName: driver.Name,
			})

			s.logger.Debug("found a matching peer!",
				zap.String("driver", driver.Name),
				zap.String("peer", filterpeer.ID.String()),
				zap.Any("addrs", filterpeer.Addrs))

			// forward the peer
			out <- filterpeer
		}
	}

	return nil
}

func (s *service) Unregister(ctx context.Context, ns string) error {
	// cancel advertiser, will trigger  unregister
	s.muAdvertiser.Lock()
	if t, ok := s.watchdogs[ns]; ok {
		if !t.Stop() {
			<-t.C
		}

		t.Reset(0)
	}
	s.muAdvertiser.Unlock()

	s.unregister(ctx, ns)
	return nil
}

func (s *service) Emit(evt *EvtDriverMonitor) {
	// s.logger.Info("emitting", zap.Any("event", evt))
	if err := s.emitter.Emit(*evt); err != nil {
		s.logger.Warn("unable to emit `EvtDriverMonitor`", zap.Error(err))
	}
}

func (s *service) Close() error {
	return s.networkNotify.Close()
}

type findPeersTimer struct {
	Ctx context.Context
	T   *time.Timer
}

type watchdogsDiscoverer struct {
	rootctx context.Context

	logger *zap.Logger
	disc   p2p_discovery.Discoverer

	resetInterval time.Duration

	findpeers   map[string]*findPeersTimer
	mufindpeers sync.Mutex
}

func newWatchdogsDiscoverer(ctx context.Context, logger *zap.Logger, resetInterval time.Duration, disc p2p_discovery.Discovery) p2p_discovery.Discoverer {
	w := &watchdogsDiscoverer{
		rootctx:       ctx,
		findpeers:     make(map[string]*findPeersTimer),
		resetInterval: resetInterval,
		logger:        logger,
		disc:          disc,
	}

	return w
}

func (w *watchdogsDiscoverer) FindPeers(_ context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	// override context with our context
	ctx := w.rootctx

	w.mufindpeers.Lock()
	defer w.mufindpeers.Unlock()

	timer := time.Now()

	if ft, ok := w.findpeers[ns]; ok {
		// already running find peers
		if !ft.T.Stop() {
			<-ft.T.C
		}
		ft.T.Reset(w.resetInterval)

		return w.disc.FindPeers(ft.Ctx, ns, opts...)
	}

	ctx, cancel := context.WithCancel(ctx)

	w.logger.Debug("watchdogs looking for peers", zap.String("ns", ns))
	c, err := w.disc.FindPeers(ctx, ns, opts...)
	if err != nil {
		cancel()
		return nil, err
	}

	t := time.AfterFunc(w.resetInterval, func() {
		cancel()
		w.logger.Debug("findpeers expired",
			zap.String("ns", ns),
			zap.Duration("duration", time.Since(timer)),
		)

		w.mufindpeers.Lock()
		delete(w.findpeers, ns)
		w.mufindpeers.Unlock()
	})

	w.findpeers[ns] = &findPeersTimer{ctx, t}
	return c, nil
}

type discoveryMonitor struct {
	host    host.Host
	logger  *zap.Logger
	disc    p2p_discovery.Discovery
	emitter p2p_event.Emitter
}

// Advertise advertises a service
func (d *discoveryMonitor) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	ttl, err := d.disc.Advertise(ctx, ns, opts...)
	if err == nil {
		d.Emit(&EvtDriverMonitor{
			EventType: TypeEventMonitorAdvertise,
			AddrInfo: p2p_peer.AddrInfo{
				ID:    d.host.ID(),
				Addrs: d.host.Addrs(),
			},
			Topic: ns,
		})
	}

	return ttl, err
}

// FindPeers discovers peers providing a service
func (d *discoveryMonitor) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan peer.AddrInfo, error) {
	c, err := d.disc.FindPeers(ctx, ns, opts...)
	if err != nil {
		return nil, err
	}

	retc := make(chan peer.AddrInfo)
	go func() {
		for p := range c {
			d.Emit(&EvtDriverMonitor{
				EventType: TypeEventMonitorFoundPeer,
				AddrInfo:  p,
				Topic:     ns,
			})
			retc <- p
		}

		close(retc)
	}()

	return retc, err
}

func (d *discoveryMonitor) Emit(evt *EvtDriverMonitor) {
	if err := d.emitter.Emit(*evt); err != nil {
		d.logger.Warn("unable to emit `EvtDriverMonitor`", zap.Error(err))
	}
}
