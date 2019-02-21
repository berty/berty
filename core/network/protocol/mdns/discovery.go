package mdns

import (
	"context"
	"time"

	"berty.tech/core/pkg/tracing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	host "github.com/libp2p/go-libp2p-host"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	service "github.com/libp2p/go-libp2p/p2p/discovery"
)

var _ discovery.Discovery = (*Discovery)(nil)

type Discovery struct {
	host    host.Host
	service service.Service
	notifee *notifee
}

func NewDiscovery(ctx context.Context, host host.Host) (discovery.Discovery, error) {
	return &Discovery{
		host:    host,
		service: nil,
		notifee: nil,
	}, nil
}

func (d *Discovery) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := d.wakeService(ctx); err != nil {
		return 0, err
	}
	return 10 * time.Second, nil
}

func (d *Discovery) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan pstore.PeerInfo, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()

	if err := d.wakeService(ctx); err != nil {
		return nil, err
	}
	if d.notifee == nil {
		d.notifee = &notifee{
			piChan: make(chan pstore.PeerInfo, 1),
		}
		d.service.RegisterNotifee(d.notifee)
	}
	return d.notifee.piChan, nil
}

func (d *Discovery) wakeService(ctx context.Context) error {
	var err error

	if d.service != nil {
		return nil
	}

	d.service, err = service.NewMdnsService(ctx, d.host, 10*time.Second, "berty")
	if err != nil {
		return err
	}

	return nil
}

var _ service.Notifee = (*notifee)(nil)

type notifee struct {
	piChan chan pstore.PeerInfo
}

func (n *notifee) HandlePeerFound(pi pstore.PeerInfo) {
	n.piChan <- pi
}
