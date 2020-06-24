package tinder

import (
	"context"
	"reflect"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
)

// MultiDriver is a simple driver manager, that forward request across multiple driver
type MultiDriver struct {
	logger  *zap.Logger
	drivers []Driver

	mapc map[string]context.CancelFunc
	muc  sync.Mutex
}

func NewMultiDriver(logger *zap.Logger, drivers ...Driver) Driver {
	return &MultiDriver{
		logger:  logger.Named("tinder/multi"),
		drivers: drivers,
		mapc:    make(map[string]context.CancelFunc),
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

	md.muc.Lock()
	if cf, ok := md.mapc[ns]; ok {
		cf()
	}

	ctx, cf := context.WithCancel(ctx)
	md.mapc[ns] = cf
	md.muc.Unlock()

	for _, driver := range md.drivers {
		md.advertise(ctx, driver, ns, opts...)
	}

	return options.Ttl, nil
}

func (md *MultiDriver) advertise(ctx context.Context, d Driver, ns string, opts ...p2p_discovery.Option) {
	go func() {
		for {
			ttl, err := d.Advertise(ctx, ns, opts...)
			if err != nil {
				md.logger.Warn("failed to advertise",
					zap.String("driver", d.Name()),
					zap.String("key", ns),
					zap.Error(err),
				)
				if ctx.Err() != nil {
					return
				}

				select {
				case <-time.After(10 * time.Second):
					continue
				case <-ctx.Done():
					return
				}
			}

			md.logger.Info("advertise", zap.String("driver", d.Name()), zap.String("key", ns))
			if ttl < 1 {
				return
			}
			wait := 7 * ttl / 8
			select {
			case <-time.After(wait):
			case <-ctx.Done():
				return
			}
		}
	}()
}

// FindPeers for MultiDriver doesn't care about duplicate peers, his only
// job here is to dispatch FindPeers request across all the drivers.
func (md *MultiDriver) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	ctx, cancel := context.WithCancel(ctx)

	md.logger.Debug("looking for peers", zap.String("key", ns))

	// @NOTE(gfanton): I prefer the use of select to limit the number of goroutines
	const selDone = 0
	selCases := make([]reflect.SelectCase, 1)
	selCases[selDone] = reflect.SelectCase{
		Dir:  reflect.SelectRecv,
		Chan: reflect.ValueOf(ctx.Done()),
	}

	driverRefs := make([]string, 1)
	for _, driver := range md.drivers {
		ch, err := driver.FindPeers(ctx, ns, opts...)
		if err != nil { // @TODO(gfanton): log this
			md.logger.Warn("failed to run find peers",
				zap.String("driver", driver.Name()),
				zap.String("key", ns),
				zap.Error(err))

			continue
		}

		driverRefs = append(driverRefs, driver.Name())
		selCases = append(selCases, reflect.SelectCase{
			Dir:  reflect.SelectRecv,
			Chan: reflect.ValueOf(ch),
		})
	}

	ndrivers := len(selCases) - 1 // we dont want to wait for the context
	if ndrivers == 0 {
		md.logger.Error("no drivers available to find peers")
	}

	cpeers := make(chan p2p_peer.AddrInfo, ndrivers)
	go func() {
		defer cancel()
		defer close(cpeers)

		for ndrivers > 0 {
			idx, value, ok := reflect.Select(selCases)

			// context has been cancel stop and close chan
			if idx == selDone {
				md.logger.Debug("find peers done", zap.Error(ctx.Err()))
				return
			}

			if !ok {
				// The chosen channel has been closed, so zero out the channel to disable the case
				selCases[idx].Chan = reflect.ValueOf(nil)
				ndrivers--
				continue
			}

			// we can safly get our peer
			peer := value.Interface().(p2p_peer.AddrInfo)
			// fmt.Printf("[multi] found a peers: %v for %s\n", peer, ns)

			md.logger.Debug("found a peer",
				zap.String("driver", driverRefs[idx]), zap.String("key", ns), zap.String("peer", peer.ID.String()))

			// forward the peer
			cpeers <- peer
		}
	}()

	return cpeers, nil
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
