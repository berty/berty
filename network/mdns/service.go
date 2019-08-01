package mdns

import (
	"context"
	"sync"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	mdns_discovery "github.com/libp2p/go-libp2p/p2p/discovery"
)

// Service is the same as mdns_discovery.Service but can be Disable/Enable on demand
type Service interface {
	mdns_discovery.Service

	Enable() error
	Disable() error
}

type mdns struct {
	ns        []mdns_discovery.Notifee
	muNotifee sync.Mutex
	tag       string
	service   mdns_discovery.Service
	interval  time.Duration
	host      host.Host
}

type noop struct{}

func (*noop) Enable() error                              { return nil }
func (*noop) Disable() error                             { return nil }
func (*noop) Close() error                               { return nil }
func (*noop) RegisterNotifee(_ mdns_discovery.Notifee)   {}
func (*noop) UnregisterNotifee(_ mdns_discovery.Notifee) {}

func NewNoopService() Service {
	return &noop{}
}

func NewService(h host.Host, interval time.Duration, tag string) Service {
	return &mdns{
		ns:       []mdns_discovery.Notifee{},
		tag:      tag,
		interval: interval,
		host:     h,
	}
}

// Close is the same as Disable
func (m *mdns) Close() error {
	logger().Debug("closing mdns service")

	m.muNotifee.Lock()
	if m.service != nil {
		for _, notif := range m.ns {
			m.service.UnregisterNotifee(notif)
		}
	}

	m.ns = []mdns_discovery.Notifee{}
	m.muNotifee.Unlock()

	return m.Disable()
}

// Enable mdns service
func (m *mdns) Enable() error {
	m.muNotifee.Lock()
	defer m.muNotifee.Unlock()

	if m.service != nil {
		logger().Warn("mdns service already enable")
		return nil
	}

	s, err := mdns_discovery.NewMdnsService(context.Background(), m.host, m.interval, m.tag)
	if err != nil {
		return err
	}

	for _, n := range m.ns {
		s.RegisterNotifee(n)
	}

	m.service = s
	logger().Debug("mdns service enabled")
	return nil
}

// Disable mdns service
func (m *mdns) Disable() (err error) {
	m.muNotifee.Lock()
	defer m.muNotifee.Unlock()

	if m.service == nil {
		logger().Warn("mdns service already disable")
		return
	}

	err = m.service.Close()
	m.service = nil
	return
}

func (m *mdns) RegisterNotifee(n mdns_discovery.Notifee) {
	m.muNotifee.Lock()
	m.ns = append(m.ns, n)
	if m.service != nil {
		m.service.RegisterNotifee(n)
	}
	m.muNotifee.Unlock()
}

func (m *mdns) UnregisterNotifee(n mdns_discovery.Notifee) {
	m.muNotifee.Lock()
	defer m.muNotifee.Unlock()

	for i, notif := range m.ns {
		if notif == n {
			m.ns = append(m.ns[:i], m.ns[i+1:]...)
			if m.service != nil {
				m.service.UnregisterNotifee(n)
			}

			return
		}
	}

	return
}
