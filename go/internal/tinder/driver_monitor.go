package tinder

import (
	"context"
	fmt "fmt"
	"strings"
	"time"

	p2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	p2p_event "github.com/libp2p/go-libp2p-core/event"
	p2p_host "github.com/libp2p/go-libp2p-core/host"
	p2p_peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"
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

type DriverMonitor struct {
	logger  *zap.Logger
	h       p2p_host.Host
	driver  AsyncableDriver
	emitter p2p_event.Emitter
}

func MonitorDriver(l *zap.Logger, h p2p_host.Host, driver Driver) (Driver, error) {
	asDriver := ComposeAsyncableDriver(driver, &noopAsyncDriver{})
	return MonitorDriverAsync(l, h, asDriver)
}

func MonitorDriverAsync(l *zap.Logger, h p2p_host.Host, adriver AsyncableDriver) (AsyncableDriver, error) {
	emitter, err := h.EventBus().Emitter(new(EvtDriverMonitor))
	if err != nil {
		return nil, err
	}
	return &DriverMonitor{
		driver:  adriver,
		emitter: emitter,
		logger:  l,
		h:       h,
	}, nil
}

func (d *DriverMonitor) Advertise(ctx context.Context, ns string, opts ...p2p_discovery.Option) (ttl time.Duration, err error) {
	topic := strings.TrimPrefix(ns, "floodsub:")
	if ttl, err = d.driver.Advertise(ctx, ns, opts...); err == nil {
		d.Emit(&EvtDriverMonitor{
			EventType:  TypeEventMonitorAdvertise,
			Topic:      topic,
			AddrInfo:   *p2p_host.InfoFromHost(d.h),
			DriverName: d.driver.Name(),
		})
	}

	return
}

func (d *DriverMonitor) FindPeers(ctx context.Context, ns string, opts ...p2p_discovery.Option) (<-chan p2p_peer.AddrInfo, error) {
	ccDriver, err := d.driver.FindPeers(ctx, ns, opts...)
	if err != nil {
		return nil, err
	}

	topic := strings.TrimPrefix(ns, "floodsub:")
	ccMonitor := make(chan p2p_peer.AddrInfo)
	go func() {
		defer close(ccMonitor)
		for p := range ccDriver {
			d.Emit(&EvtDriverMonitor{
				EventType:  TypeEventMonitorFoundPeer,
				Topic:      topic,
				AddrInfo:   p,
				DriverName: d.driver.Name(),
			})
			ccMonitor <- p
		}
	}()

	return ccMonitor, nil
}

func (d *DriverMonitor) FindPeersAsync(ctx context.Context, ccMonitor chan<- p2p_peer.AddrInfo, ns string, opts ...p2p_discovery.Option) error {
	topic := strings.TrimPrefix(ns, "floodsub:")
	ccDriver := make(chan p2p_peer.AddrInfo)
	defer close(ccDriver)
	go func() {
		for p := range ccDriver {
			d.Emit(&EvtDriverMonitor{
				EventType:  TypeEventMonitorFoundPeer,
				Topic:      topic,
				AddrInfo:   p,
				DriverName: d.driver.Name(),
			})
			ccMonitor <- p
		}
	}()
	return d.driver.FindPeersAsync(ctx, ccDriver, ns, opts...)
}

func (d *DriverMonitor) Unregister(ctx context.Context, ns string) error {
	return d.driver.Unregister(ctx, ns)
}

func (d *DriverMonitor) Name() string {
	return fmt.Sprintf("%s:Monitor", d.driver.Name())
}

func (d *DriverMonitor) Emit(evt *EvtDriverMonitor) {
	if err := d.emitter.Emit(*evt); err != nil {
		d.logger.Warn("unable to emit `EvtDriverMonitor`", zap.Error(err))
	}
}
