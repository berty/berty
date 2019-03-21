package mdns

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/pkg/tracing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	host "github.com/libp2p/go-libp2p-host"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	service "github.com/libp2p/go-libp2p/p2p/discovery"
)

var _ discovery.Discovery = (*Discovery)(nil)

type Discovery struct {
	host     host.Host
	services map[string]service.Service
	notifees map[string]*notifee
	mutex    sync.Mutex
}

func NewDiscovery(ctx context.Context, host host.Host) (discovery.Discovery, error) {
	return &Discovery{
		host:     host,
		services: map[string]service.Service{},
		notifees: map[string]*notifee{},
	}, nil
}

func (d *Discovery) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := d.wakeService(ctx, ns); err != nil {
		return 0, err
	}
	time.Sleep(10 * time.Second)
	return 10 * time.Second, nil
}

func (d *Discovery) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan pstore.PeerInfo, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := d.wakeService(ctx, ns); err != nil {
		return nil, err
	}

	return d.notifees[ns].piChan, nil
}

func (d *Discovery) wakeService(ctx context.Context, ns string) error {
	var err error

	d.mutex.Lock()
	_, ok := d.services[ns]
	if ok {
		return nil
	}

	d.services[ns], err = service.NewMdnsService(ctx, d.host, 10*time.Second, ns)
	if err != nil {
		return err
	}

	_, ok = d.notifees[ns]
	if !ok {
		d.notifees[ns] = &notifee{
			piChan: make(chan pstore.PeerInfo, 1),
		}
		d.services[ns].RegisterNotifee(d.notifees[ns])
	}
	d.mutex.Unlock()

	return nil
}

var _ service.Notifee = (*notifee)(nil)

type notifee struct {
	piChan chan pstore.PeerInfo
}

func (n *notifee) HandlePeerFound(pi pstore.PeerInfo) {
	if pi.ID != "" {
		n.piChan <- pi
	}
}
