package host

import (
	"context"
	"time"

	discovery "github.com/libp2p/go-libp2p-discovery"
	pstore "github.com/libp2p/go-libp2p-peerstore"
)

var _ discovery.Discovery = (*BertyDiscovery)(nil)

type BertyDiscovery struct {
	discoveries []discovery.Discovery
}

func NewBertyDiscovery(ctx context.Context, discoveries []discovery.Discovery) discovery.Discovery {
	d := &BertyDiscovery{
		discoveries: discoveries,
	}
	return d
}

func (d *BertyDiscovery) Advertise(ctx context.Context, ns string, opts ...discovery.Option) (time.Duration, error) {
	t := time.Now()

	waitChans := []chan struct{}{}
	for i := range waitChans {
		waitChans[i] = make(chan struct{}, 1)
	}

	for i := range d.discoveries {
		d := d.discoveries[i]
		waitChan := waitChans[i]

		go func() {
			_, err := d.Advertise(ctx, ns, opts...)
			waitChan <- struct{}{}
			if err != nil {
				logger().Error(err.Error())
				return
			}
		}()
	}

	for i := range d.discoveries {
		<-waitChans[i]
	}

	return time.Now().Sub(t), nil
}

func (d *BertyDiscovery) FindPeers(ctx context.Context, ns string, opts ...discovery.Option) (<-chan pstore.PeerInfo, error) {
	globPiChan := make(chan pstore.PeerInfo, 1)

	for i := range d.discoveries {
		d := d.discoveries[i]

		go func() {
			piChan, err := d.FindPeers(ctx, ns, opts...)
			if err != nil {
				logger().Error(err.Error())
				return
			}
			for {
				select {
				case pi := <-piChan:
					globPiChan <- pi
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	return globPiChan, nil
}
