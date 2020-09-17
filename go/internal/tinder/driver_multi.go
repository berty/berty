package tinder

import (
	"context"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/multierr"
	"go.uber.org/zap"
)

// MultiDriver is a simple driver manager, that forward request across multiple driver
type MultiDriver struct {
	logger *zap.Logger
	// Stores AsyncableDriver for ease with AsyncMultiDriver.
	// That mean they must be bundeled in a noop.
	drivers []AsyncableDriver

	mapc map[string]context.CancelFunc
	muc  sync.Mutex
}

func NewMultiDriver(logger *zap.Logger, drivers ...Driver) Driver {
	switch len(drivers) {
	case 0:
		panic("tinder.NewMultiDriver requires at least one driver")
	case 1:
		return drivers[0]
	default:
		noopedDrivers := make([]AsyncableDriver, len(drivers))
		for i, v := range drivers {
			noopedDrivers[i] = noopAsyncDriver{v}
		}
		return &MultiDriver{
			logger:  logger.Named("tinder/multi"),
			drivers: noopedDrivers,
			mapc:    make(map[string]context.CancelFunc),
		}
	}
}

type noopAsyncDriver struct{ Driver }

func (noopAsyncDriver) FindPeersAsync(ctx context.Context, outPeers chan<- p2p_peer.AddrInfo, ns string, opts ...p2p_discovery.Option) error {
	return nil
}

type AsyncMultiDriver struct{ MultiDriver }

func NewAsyncMultiDriver(logger *zap.Logger, drivers ...AsyncableDriver) AsyncableDriver {
	switch len(drivers) {
	case 0:
		panic("tinder.NewMultiDriver requires at least one driver")
	case 1:
		return drivers[0]
	default:
		return &AsyncMultiDriver{MultiDriver{
			logger:  logger.Named("tinder/multi"),
			drivers: drivers,
			mapc:    make(map[string]context.CancelFunc),
		}}
	}
}

// Advertise simply dispatch Advertise request across all the drivers
func (md *MultiDriver) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	// Get options
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return 0, err
	}

	md.logger.Debug("Advertising", zap.String("key", ns))

	md.muc.Lock()
	if cf, ok := md.mapc[ns]; ok {
		cf()
	}

	ctx, cf := context.WithCancel(ctx)
	md.mapc[ns] = cf
	md.muc.Unlock()

	ndrivers := len(md.drivers)
	// We don't use a lock array because what we execute next is so cheap it's not worth the extra context switches that generates.
	var wg sync.WaitGroup
	wg.Add(ndrivers)
	errReturn := make([]error, ndrivers)
	durationReturn := make([]time.Duration, ndrivers)
	for i := 0; i < ndrivers; i++ {
		go func(j int) {
			defer wg.Done()
			durationReturn[j], errReturn[j] = md.drivers[j].Advertise(ctx, ns, opts...)
		}(i)
	}
	wg.Wait()

	for i, v := range errReturn {
		// Check if at least one was successful
		if v == nil {
			// One was, fetch the longer ttl
			bestDuration := durationReturn[i]
			for j := i + 1; j < ndrivers; j++ {
				durj := durationReturn[j]
				if durj > bestDuration {
					bestDuration = durj
				}
			}
			if options.Ttl != 0 && bestDuration > options.Ttl {
				return options.Ttl, nil
			}
			return bestDuration, nil
		}
	}

	return 0, multierr.Combine(errReturn...)
}

const maxLimit = 1000

func (md *MultiDriver) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return nil, err
	}
	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	// Buffer to try to limit context switch while returning peers.
	outPeers := make(chan p2p_peer.AddrInfo, limit)
	ctx, cancelSearch := context.WithCancel(ctx)
	// This wait group is used to close outPeers when we are finished.
	var wg sync.WaitGroup
	ndrivers := len(md.drivers)
	wg.Add(ndrivers)
	errReturn := make([]error, ndrivers)
	// This wait group is used to know when to check for errors.
	var errWg sync.WaitGroup
	errWg.Add(ndrivers)
	alreadySeen := make(map[p2p_peer.ID]struct{})
	var peerCount int
	var seenLock sync.Mutex
	for i := 0; i < ndrivers; i++ {
		go func(j int) {
			defer wg.Done()
			ctx, cancel := context.WithCancel(ctx)
			defer cancel()
			var inPeers <-chan p2p_peer.AddrInfo
			inPeers, errReturn[j] = md.drivers[j].FindPeers(ctx, ns, opts...)
			errWg.Done()
			if errReturn[j] != nil {
				return
			}
			for v := range inPeers {
				id := v.ID
				seenLock.Lock()
				if peerCount == limit {
					seenLock.Unlock()
					return
				}
				_, ok := alreadySeen[id]
				if ok {
					seenLock.Unlock()
					continue
				}
				alreadySeen[id] = struct{}{}
				peerCount++
				seenLock.Unlock()
				select {
				case outPeers <- v:
				case <-ctx.Done():
					return
				}
			}
		}(i)
	}
	errWg.Wait()
	for _, v := range errReturn {
		if v == nil {
			// At least one was successful
			go func() {
				wg.Wait()
				cancelSearch()
				close(outPeers)
			}()
			return outPeers, nil
		}
	}

	cancelSearch()
	return nil, multierr.Combine(errReturn...)
}

// FindPeersAsync expect the caller to use it asynchronously and cancel the context with enough peers or found (or deadline exceeded).
// If the context is not canceled the search will go indefinitely.
func (md *MultiDriver) FindPeersAsync(ctx context.Context, outPeers chan<- p2p_peer.AddrInfo, ns string, opts ...p2p_discovery.Option) error {
	var options p2p_discovery.Options
	err := options.Apply(opts...)
	if err != nil {
		return err
	}
	limit := options.Limit
	if limit == 0 || limit > maxLimit {
		limit = maxLimit
	}

	// Buffer to try to limit context switch while returning peers.
	inPeers := make(chan p2p_peer.AddrInfo, limit)

	// Start the fetchers first.
	ctx, cancelSearch := context.WithCancel(ctx)
	ndrivers := len(md.drivers)
	errReturn := make([]error, ndrivers)
	for i := 0; i < ndrivers; i++ {
		errReturn[i] = md.drivers[i].FindPeersAsync(ctx, inPeers, ns, opts...)
	}
	for _, v := range errReturn {
		if v == nil {
			// At least one is working
			go func() {
				// We could maybe mux multiple FindPeers with the same key but that will add an other syncing cost.
				alreadySeen := make(map[p2p_peer.ID]struct{})
				var peerCount int
				for peerCount < limit {
					select {
					case info := <-inPeers:
						id := info.ID
						_, ok := alreadySeen[id]
						if ok {
							continue
						}
						alreadySeen[id] = struct{}{}
						select {
						case outPeers <- info:
						case <-ctx.Done():
							return
						}
					case <-ctx.Done():
						return
					}
					peerCount++
				}
				cancelSearch()
			}()
			return nil
		}
	}
	cancelSearch()
	return multierr.Combine(errReturn...)
}

func (md *MultiDriver) Unregister(ctx context.Context, ns string) error {
	// first cancel advertiser
	md.muc.Lock()
	if cf, ok := md.mapc[ns]; ok {
		cf()
		delete(md.mapc, ns)
	}
	md.muc.Unlock()

	// unregister drivers
	for _, driver := range md.drivers {
		_ = driver.Unregister(ctx, ns) // @TODO(gfanton): log this
	}

	return nil
}

func (*MultiDriver) Name() string { return "MultiDriver" }
