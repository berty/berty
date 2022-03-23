package tinder

import (
	"context"
	"fmt"
	"reflect"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

type findPeersTimer struct {
	Ctx context.Context
	T   *time.Timer
}

type BackoffOpts struct {
	StratFactory     discovery.BackoffFactory
	DiscoveryOptions []discovery.BackoffDiscoveryOption
}

type watchdogsDiscoverer struct {
	rootctx context.Context

	logger        *zap.Logger
	disc          p2p_discovery.Discoverer
	resetInterval time.Duration

	findpeers   map[string]*findPeersTimer
	mufindpeers sync.Mutex
}

func newWatchdogsDiscoverer(ctx context.Context, l *zap.Logger, h host.Host, resetInterval time.Duration, backoff *BackoffOpts, drivers []*Driver) (*watchdogsDiscoverer, error) {
	mdisc := newMultiDriverDiscoverer(l, h, drivers...)

	// compose discovery for backoff
	var disc p2p_discovery.Discovery = &DriverDiscovery{
		Advertiser: NoopDiscovery,
		Discoverer: mdisc,
	}

	// add backoff strategy if provided
	if backoff != nil && backoff.StratFactory != nil {
		// wrap backoff/cache discovery
		var err error
		if disc, err = discovery.NewBackoffDiscovery(disc, backoff.StratFactory, backoff.DiscoveryOptions...); err != nil {
			return nil, err
		}
	}

	return &watchdogsDiscoverer{
		rootctx:       ctx,
		resetInterval: resetInterval,
		findpeers:     make(map[string]*findPeersTimer),
		logger:        l,
		disc:          disc,
	}, nil
}

func (w *watchdogsDiscoverer) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	var options p2p_discovery.Options
	if err := options.Apply(opts...); err != nil {
		return nil, err
	}

	if _, ok := options.Other[optionKeepContext]; !ok {
		// override context with our context
		ctx = w.rootctx
	}

	w.mufindpeers.Lock()
	defer w.mufindpeers.Unlock()

	if ft, ok := w.findpeers[ns]; ok {
		// already running find peers
		if !ft.T.Stop() {
			<-ft.T.C
		}
		ft.T.Reset(w.resetInterval)

		// return alreay existing chan
		return w.disc.FindPeers(ft.Ctx, ns, opts...)
	}

	timer := time.Now()
	ctx, cancel := context.WithCancel(ctx)

	w.logger.Debug("watchdogs looking for peers", logutil.PrivateString("ns", ns))
	c, err := w.disc.FindPeers(ctx, ns, opts...)
	if err != nil {
		cancel()
		return nil, err
	}

	t := time.AfterFunc(w.resetInterval, func() {
		cancel()
		w.logger.Debug("findpeers expired",
			logutil.PrivateString("ns", ns),
			zap.Duration("duration", time.Since(timer)),
		)

		w.mufindpeers.Lock()
		delete(w.findpeers, ns)
		w.mufindpeers.Unlock()
	})

	w.findpeers[ns] = &findPeersTimer{ctx, t}
	return c, nil
}

type multiDriverDiscoverer struct {
	logger  *zap.Logger
	drivers []*Driver
	host    host.Host
}

type driverChan struct {
	driver *Driver
	cc     <-chan p2p_peer.AddrInfo
	topic  string
}

func newMultiDriverDiscoverer(logger *zap.Logger, h host.Host, drivers ...*Driver) *multiDriverDiscoverer {
	return &multiDriverDiscoverer{
		logger:  logger,
		drivers: drivers,
		host:    h,
	}
}

func (s *multiDriverDiscoverer) ProtectPeer(id p2p_peer.ID) {
	s.host.ConnManager().Protect(id, TinderPeer)
}

func (s *multiDriverDiscoverer) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	var options p2p_discovery.Options
	if err := options.Apply(opts...); err != nil {
		return nil, err
	}

	var filters []string
	if f, ok := options.Other[optionFilterDriver]; ok {
		if filters, ok = f.([]string); !ok {
			return nil, fmt.Errorf("unable to parse filter driver option")
		}
	}

	s.logger.Debug("find peers started", logutil.PrivateString("key", ns), zap.Int("drivers", len(s.drivers)))

	cc := make(chan p2p_peer.AddrInfo)
	if len(s.drivers) == 0 {
		close(cc)
		return cc, nil
	}

	ctx, cancel := context.WithCancel(ctx)
	cdrivers := []*driverChan{}
	for _, driver := range s.drivers {
		if shoudlFilterDriver(driver.Name, filters) {
			continue
		}

		ch, err := driver.FindPeers(ctx, ns, opts...)
		if err != nil {
			s.logger.Warn("failed to run find peers",
				zap.String("driver", driver.Name),
				logutil.PrivateString("ns", ns),
				zap.Error(err))

			continue
		}

		s.logger.Debug("findpeer for driver started", zap.String("driver", driver.Name), logutil.PrivateString("ns", ns))
		cdrivers = append(cdrivers, &driverChan{
			cc:     ch,
			driver: driver,
			topic:  ns,
		})
	}

	go func() {
		defer cancel()
		defer close(cc)

		// @TODO(gfanton): use optimized method for few drivers
		err := s.selectFindPeers(ctx, cc, cdrivers)
		s.logger.Debug("find peers done", logutil.PrivateString("ns", ns), zap.Error(err))
	}()

	return cc, nil
}

func (s *multiDriverDiscoverer) selectFindPeers(ctx context.Context, out chan<- p2p_peer.AddrInfo, in []*driverChan) error {
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
			return ctx.Err()
		}

		if !ok {
			// The chosen channel has been closed, so zero out the channel to disable the case
			selCases[sel].Chan = reflect.ValueOf(nil)
			n--
			continue
		}

		driver := in[sel].driver
		// we can safly get our peer
		peer := value.Interface().(p2p_peer.AddrInfo)

		// skip self
		if peer.ID == s.host.ID() {
			continue
		}

		topic := in[sel].topic

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

			s.logger.Debug("found a peer",
				zap.String("driver", driver.Name),
				logutil.PrivateString("peer", filterpeer.ID.String()),
				logutil.PrivateString("ns", topic),
				zap.Any("addrs", filterpeer.Addrs))

			// forward the peer
			out <- filterpeer
		} else {
			s.logger.Debug("found a peer but unable to add it, no valid addrs",
				zap.String("driver", driver.Name),
				logutil.PrivateString("peer", peer.ID.String()),
				logutil.PrivateString("ns", topic),
				zap.Any("addrs", peer.Addrs),
				zap.Any("filter addrs", addrs))
		}
	}

	return nil
}
