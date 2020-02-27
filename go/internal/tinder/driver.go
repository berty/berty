package tinder

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p-core/discovery"
	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	"github.com/libp2p/go-libp2p-core/peer"
)

// Driver is a libp2p_discovery.Discovery
var _ libp2p_discovery.Discovery = (Driver)(nil)

type Unregister interface {
	Unregister(ctx context.Context, ns string) error
}

// Driver is Discovery with a unregister method
type Driver interface {
	libp2p_discovery.Discovery
	Unregister
}

type composeDriver struct {
	advertiser libp2p_discovery.Advertiser
	discoverer libp2p_discovery.Discoverer
	unregister Unregister
}

func (d *composeDriver) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	return d.advertiser.Advertise(ctx, ns, opts...)
}

func (d *composeDriver) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan peer.AddrInfo, error) {
	return d.discoverer.FindPeers(ctx, ns, opts...)
}

func (d *composeDriver) Unregister(ctx context.Context, ns string) error {
	return d.unregister.Unregister(ctx, ns)
}

func ComposeDriver(advertiser libp2p_discovery.Advertiser, discover libp2p_discovery.Discovery, unregister Unregister) Driver {
	return &composeDriver{
		advertiser: advertiser,
		discoverer: discover,
		unregister: unregister,
	}
}
