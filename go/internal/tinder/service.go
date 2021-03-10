package tinder

import (
	"context"
	fmt "fmt"
	"io"
	"reflect"
	"sync"
	"time"

	p2p_event "github.com/libp2p/go-libp2p-core/event"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peer"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	p2p_discovery "github.com/libp2p/go-libp2p-discovery"
	"go.uber.org/zap"
)

const (
	DefaultAdvertiseInterval    = time.Minute
	DefaultAdvertiseGracePeriod = time.Second * 10
)

type EventMonitor int

const (
	TypeEventMonitorUnknown EventMonitor = iota
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

	Drivers                []Driver
	Host                   host.Host
	AdvertiseResetInterval time.Duration
	AdvertiseGracePeriod   time.Duration
	BackoffStratFactory    p2p_discovery.BackoffFactory
	DiscovertyOptions      []p2p_discovery.BackoffDiscoveryOption
}

func (o *Opts) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}

	if o.AdvertiseResetInterval == 0 {
		o.AdvertiseResetInterval = DefaultAdvertiseInterval
	}

	if o.AdvertiseGracePeriod == 0 {
		o.AdvertiseGracePeriod = DefaultAdvertiseGracePeriod
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

	// wrap backoff/cache discovery
	bdisc, err := p2p_discovery.NewBackoffDiscovery(s, opts.BackoffStratFactory, opts.DiscovertyOptions...)
	if err != nil {
		return nil, err
	}

	// compose backoff with tinder service
	var service struct {
		*Driver
		io.Closer
	}

	service.Driver = &Driver{
		Name:         "tinder",
		Discovery:    bdisc,
		Unregisterer: s,
	}
	service.Closer = s

	return service, nil
}

func newService(opts *Opts, h host.Host, drivers ...*Driver) (*service, error) {
	nn, err := NewNetworkUpdate(opts.Host)
	if err != nil {
		return nil, err
	}

	// create monitor update
	emitter, err := h.EventBus().Emitter(new(EvtDriverMonitor))
	if err != nil {
		return nil, err
	}

	s := &service{
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

func (s *service) Unregister(ctx context.Context, ns string) error {
	// first cancel advertiser
	s.muAdvertiser.Lock()
	if t, ok := s.watchdogs[ns]; ok {
		if !t.Stop() {
			<-t.C
		}

		t.Reset(0)
	}
	s.muAdvertiser.Unlock()

	// unregister drivers
	for _, driver := range s.drivers {
		if driver.Unregisterer != nil {
			if err := driver.Unregister(ctx, ns); err != nil {
				s.logger.Warn("unable to unsubscribe", zap.Error(err))
			}
		}
	}

	return nil
}

func (s *service) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	if len(s.drivers) == 0 {
		return 0, fmt.Errorf("no drivers to advertise")
	}

	s.muAdvertiser.Lock()

	if t, ok := s.watchdogs[ns]; ok {
		if !t.Stop() {
			<-t.C
		}

		t.Reset(s.resetInterval)
	} else {
		ctx, cancel := context.WithCancel(ctx)
		s.watchdogs[ns] = time.AfterFunc(s.resetInterval, func() {
			cancel()
			s.muAdvertiser.Lock()
			delete(s.watchdogs, ns)
			s.muAdvertiser.Unlock()
		})
		s.advertises(ctx, ns, opts...)
	}

	s.muAdvertiser.Unlock()

	return s.ttl, nil
}

func (s *service) advertises(ctx context.Context, ns string, opts ...p2p_discovery.Option) {
	for _, d := range s.drivers {
		go s.advertise(ctx, d, ns, opts...)
	}
}

func (s *service) advertise(ctx context.Context, d *Driver, ns string, opts ...p2p_discovery.Option) {
	for {
		currentAddrs := s.networkNotify.GetLastUpdatedAddrs(ctx)
		ttl, err := d.Advertise(ctx, ns, opts...)

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
				EventType: TypeEventMonitorAdvertise,
				AddrInfo: p2p_peer.AddrInfo{
					ID:    s.host.ID(),
					Addrs: currentAddrs,
				},
				Topic:      ns,
				DriverName: d.Name,
			})

			deadline = 7 * ttl / 8
		}

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
	cc     <-chan peer.AddrInfo
	topic  string
}

func (s *service) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan peer.AddrInfo, error) {
	s.logger.Debug("looking for peers", zap.String("key", ns))

	cc := make(chan peer.AddrInfo)
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

		cdrivers = append(cdrivers, &driverChan{
			cc:     ch,
			driver: driver,
			topic:  ns,
		})
	}

	go func() {
		defer cancel()
		defer close(cc)

		// use optimized method for few peers
		if err := s.selectFindPeers(ctx, cc, cdrivers); err != nil {
			s.logger.Warn("find peers", zap.Error(err))
		}
	}()

	return cc, nil
}

func (s *service) selectFindPeers(ctx context.Context, out chan<- peer.AddrInfo, in []*driverChan) error {
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

		// context has been cancel stop and close chan
		if sel == selDone {
			s.logger.Debug("find peers done", zap.Error(ctx.Err()))
			return ctx.Err()
		}

		if !ok {
			// The chosen channel has been closed, so zero out the channel to disable the case
			selCases[sel].Chan = reflect.ValueOf(nil)
			n--
			continue
		}

		// we can safly get our peer
		peer := value.Interface().(peer.AddrInfo)
		s.logger.Debug("found a peer",
			zap.String("driver", in[sel].driver.Name),
			zap.String("peer", peer.ID.String()))

		s.Emit(&EvtDriverMonitor{
			EventType:  TypeEventMonitorFoundPeer,
			Topic:      in[sel].topic,
			AddrInfo:   peer,
			DriverName: in[sel].driver.Name,
		})

		// forward the peer
		out <- peer
	}

	return nil
}

func (s *service) Emit(evt *EvtDriverMonitor) {
	if err := s.emitter.Emit(*evt); err != nil {
		s.logger.Warn("unable to emit `EvtDriverMonitor`", zap.Error(err))
	}
}

func (s *service) Close() error {
	s.networkNotify.Close()
	return nil
}
