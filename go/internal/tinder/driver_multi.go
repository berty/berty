package tinder

import (
	"context"
	"fmt"
	"reflect"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	disc "github.com/libp2p/go-libp2p-discovery"
)

// MultiDriver is a simple driver manager, that forward request across multiple driver
type MultiDriver struct {
	drivers []Driver

	mapc map[string]context.CancelFunc
	muc  sync.Mutex
}

func NewMultiDriver(drivers ...Driver) Driver {
	return &MultiDriver{
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
	if _, ok := md.mapc[ns]; ok {
		md.muc.Unlock()
		// @NOTE(gfanton): should we return an error here?
		return 0, fmt.Errorf("already advertising")
	}

	ctx, cf := context.WithCancel(ctx)
	md.mapc[ns] = cf
	md.muc.Unlock()

	for _, driver := range md.drivers {
		disc.Advertise(ctx, driver, ns, opts...)
	}

	return options.Ttl, nil
}

// FindPeers for MultiDriver doesn't care about duplicate peers, his only
// job here is to dispatch FindPeers request across all the drivers.
func (md *MultiDriver) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	ctx, cancel := context.WithCancel(ctx)

	// @NOTE(gfanton): I prefer the use of select to limit the number of goroutines
	const selDone = 0
	selCases := make([]reflect.SelectCase, 1)
	selCases[selDone] = reflect.SelectCase{
		Dir:  reflect.SelectRecv,
		Chan: reflect.ValueOf(ctx.Done()),
	}

	for _, driver := range md.drivers {
		ch, err := driver.FindPeers(ctx, ns, opts...)
		if err != nil { // @TODO(gfanton): log this
			continue
		}

		selCases = append(selCases, reflect.SelectCase{
			Dir:  reflect.SelectRecv,
			Chan: reflect.ValueOf(ch),
		})
	}

	ndrivers := len(selCases) - 1 // we dont want to wait for the context
	cpeers := make(chan p2p_peer.AddrInfo, ndrivers)
	go func() {
		defer cancel()
		defer close(cpeers)

		for ndrivers > 0 {
			idx, value, ok := reflect.Select(selCases)

			// context has been cancel stop and close chan
			if idx == selDone {
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

			// forward the peer
			select {
			case cpeers <- peer:
			case <-ctx.Done():
				return
			}
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
