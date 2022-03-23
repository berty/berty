package tinder

import (
	"context"
	"fmt"
	"sync"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/host"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

type watchdogsAdvertiser struct {
	drivers []*Driver
	logger  *zap.Logger

	host          host.Host
	networkNotify *NetworkUpdate
	resetInterval time.Duration
	ttl           time.Duration
	watchdogs     map[string]*time.Timer
	muAdvertiser  sync.Mutex

	rootCtx context.Context
}

func newWatchdogsAdvertiser(ctx context.Context, l *zap.Logger, h host.Host, n *NetworkUpdate,
	resetInterval time.Duration, gracePeriod time.Duration, drivers []*Driver) *watchdogsAdvertiser {
	return &watchdogsAdvertiser{
		logger:        l,
		drivers:       drivers,
		networkNotify: n,
		host:          h,
		ttl:           resetInterval,
		resetInterval: resetInterval + gracePeriod,
		watchdogs:     make(map[string]*time.Timer),

		rootCtx: ctx,
	}
}

func (wa *watchdogsAdvertiser) Advertise(_ context.Context, ns string, opts ...p2p_discovery.Option) (time.Duration, error) {
	if len(wa.drivers) == 0 {
		return 0, fmt.Errorf("no drivers to advertise")
	}

	// override given ctx with root ctx
	ctx := wa.rootCtx
	wa.muAdvertiser.Lock()

	timer := time.Now()
	if t, ok := wa.watchdogs[ns]; ok {
		if !t.Stop() {
			<-t.C
		}

		t.Reset(wa.resetInterval)
	} else {
		wctx, cancel := context.WithCancel(ctx)
		wa.watchdogs[ns] = time.AfterFunc(wa.resetInterval, func() {
			cancel()
			wa.logger.Debug("advertise expired",
				logutil.PrivateString("ns", ns),
				zap.Duration("duration", time.Since(timer)),
			)

			wa.muAdvertiser.Lock()
			delete(wa.watchdogs, ns)
			wa.muAdvertiser.Unlock()

			// unregister drivers (?)
			// wa.unregister(ctx, ns)
		})
		wa.advertises(wctx, ns, opts...)
		wa.logger.Debug("advertise started", logutil.PrivateString("ns", ns))
	}

	wa.muAdvertiser.Unlock()

	return wa.ttl, nil
}

func (wa *watchdogsAdvertiser) unregister(ctx context.Context, ns string) {
	for _, driver := range wa.drivers {
		if err := driver.Unregister(ctx, ns); err != nil {
			wa.logger.Warn("unable to unsubscribe", zap.Error(err))
		}
	}
}

func (wa *watchdogsAdvertiser) advertises(ctx context.Context, ns string, opts ...p2p_discovery.Option) {
	var options p2p_discovery.Options
	if err := options.Apply(opts...); err != nil {
		wa.logger.Warn("unable to apply options", zap.Error(err))
		return
	}

	var filters []string
	if f, ok := options.Other[optionFilterDriver]; ok {
		if filters, ok = f.([]string); !ok {
			wa.logger.Error("unable to parse filter driver option")
			return
		}
	}

	for _, d := range wa.drivers {
		if shoudlFilterDriver(d.Name, filters) {
			continue
		}

		go wa.advertise(ctx, d, ns, opts...)
	}
}

func (wa *watchdogsAdvertiser) advertise(ctx context.Context, d *Driver, ns string, opts ...p2p_discovery.Option) {
	for {
		currentAddrs := wa.networkNotify.GetLastUpdatedAddrs(ctx)

		now := time.Now()
		ttl, err := d.Advertise(ctx, ns, opts...)
		took := time.Since(now)

		var deadline time.Duration

		if err != nil {
			wa.logger.Warn("unable to advertise",
				zap.String("driver", d.Name),
				logutil.PrivateString("ns", ns), zap.Error(err))
			select {
			case <-ctx.Done():
				return
			default:
			}

			deadline = wa.resetInterval
		} else {
			if ttl == 0 {
				ttl = wa.ttl
			}
			deadline = 4 * ttl / 5
		}

		wa.logger.Debug("advertise",
			zap.String("driver", d.Name),
			logutil.PrivateString("ns", ns),
			zap.Duration("ttl", ttl),
			zap.Duration("took", took),
			zap.Duration("next", deadline),
		)

		waitctx, cancel := context.WithTimeout(ctx, deadline)
		ok := wa.networkNotify.WaitForUpdate(waitctx, currentAddrs, d.AddrsFactory)
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

func (wa *watchdogsAdvertiser) Unregister(ctx context.Context, ns string) error {
	wa.unregister(ctx, ns)
	return nil
}
