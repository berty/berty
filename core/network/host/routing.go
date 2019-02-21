package host

import (
	"context"

	datastore "github.com/ipfs/go-datastore"
	syncdatastore "github.com/ipfs/go-datastore/sync"
	host "github.com/libp2p/go-libp2p-host"
	kaddht "github.com/libp2p/go-libp2p-kad-dht"
	routing "github.com/libp2p/go-libp2p-routing"
	"go.uber.org/zap"
)

var _ routing.IpfsRouting = (*BertyRouting)(nil)

type BertyRouting struct {
	routing.IpfsRouting
}

func NewBertyRouting(ctx context.Context, h host.Host, dhtSvc bool) (*BertyRouting, error) {
	// TODO: use go-libp2p-routing-helpers
	ds := syncdatastore.MutexWrap(datastore.NewMapDatastore())
	var dht *kaddht.IpfsDHT

	if dhtSvc {
		dht = kaddht.NewDHT(ctx, h, ds)
	} else {
		dht = kaddht.NewDHTClient(ctx, h, ds)
	}

	err := dht.BootstrapWithConfig(ctx, kaddht.DefaultBootstrapConfig)
	if err != nil {
		if closeErr := h.Close(); closeErr != nil {
			logger().Error("failed to close host", zap.Error(closeErr))
		}
		return nil, err
	}
	return &BertyRouting{dht}, nil
}
