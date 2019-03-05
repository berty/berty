package host

import (
	"context"
	"sync"
	"time"

	"berty.tech/core/pkg/tracing"
	datastore "github.com/ipfs/go-datastore"
	syncdatastore "github.com/ipfs/go-datastore/sync"
	host "github.com/libp2p/go-libp2p-host"
	kaddht "github.com/libp2p/go-libp2p-kad-dht"
	inet "github.com/libp2p/go-libp2p-net"
	routing "github.com/libp2p/go-libp2p-routing"
)

var _ routing.IpfsRouting = (*BertyRouting)(nil)

type BertyRouting struct {
	routing.IpfsRouting
	muReady *sync.Cond
	ready   bool
}

func NewBertyRouting(ctx context.Context, h host.Host, dhtSvc bool) (*BertyRouting, error) {
	tracer := tracing.EnterFunc(ctx, h, dhtSvc)
	defer tracer.Finish()
	// TODO: use go-libp2p-routing-helpers
	ds := syncdatastore.MutexWrap(datastore.NewMapDatastore())
	var dht *kaddht.IpfsDHT

	if dhtSvc {
		dht = kaddht.NewDHT(ctx, h, ds)
	} else {
		dht = kaddht.NewDHTClient(ctx, h, ds)
	}

	if err := dht.Bootstrap(ctx); err != nil {
		return nil, err
	}

	return &BertyRouting{IpfsRouting: dht}, nil
}

func (br *BertyRouting) isReady(ctx context.Context) error {
	cready := make(chan *struct{})
	go func() {
		br.muReady.L.Lock()
		if !br.ready {
			br.muReady.Wait()
		}
		cready <- nil
		br.muReady.L.Unlock()
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-cready:
		return nil
	}
}

// Connected block connection until dht is ready
func (br *BertyRouting) Connected(s inet.Network, c inet.Conn) {
	go func() {
		br.muReady.L.Lock()
		if !br.ready {
			// Wait for datastore to be ready
			time.Sleep(2 * time.Second)
			br.ready = true

			logger().Debug("DHT is now ready")

			// Advertise Provider/FindProviders that dht should be ready
			br.muReady.Broadcast()
		}
		br.muReady.L.Unlock()
	}()
}

// Disconnected wait connection to be ready before disconnect
func (br *BertyRouting) Disconnected(s inet.Network, c inet.Conn) {
	go func() {
		br.muReady.L.Lock()
		if len(s.Conns()) == 0 {
			br.ready = false
		}
		br.muReady.L.Unlock()
	}()
}
