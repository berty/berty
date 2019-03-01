package host

import (
	"context"

	"berty.tech/core/pkg/tracing"
	datastore "github.com/ipfs/go-datastore"
	syncdatastore "github.com/ipfs/go-datastore/sync"
	host "github.com/libp2p/go-libp2p-host"
	kaddht "github.com/libp2p/go-libp2p-kad-dht"
	routing "github.com/libp2p/go-libp2p-routing"
)

var _ routing.IpfsRouting = (*BertyRouting)(nil)

type BertyRouting struct {
	routing.IpfsRouting
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

	return &BertyRouting{dht}, nil
}
