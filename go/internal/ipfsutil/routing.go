package ipfsutil

import (
	"context"
	"math/rand"

	tinder "berty.tech/berty/v2/go/internal/tinder"
	datastore "github.com/ipfs/go-datastore"
	ipfs_p2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/routing"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopts "github.com/libp2p/go-libp2p-kad-dht/opts"
	record "github.com/libp2p/go-libp2p-record"
	"go.uber.org/zap"
)

type RoutingOut struct {
	*dht.IpfsDHT
	tinder.Routing
}

func NewTinderRouting(logger *zap.Logger, rdvpeer peer.ID, dhtclient bool) (ipfs_p2p.RoutingOption, <-chan *RoutingOut) {
	crout := make(chan *RoutingOut, 1)
	return func(ctx context.Context, h host.Host, dstore datastore.Batching, validator record.Validator) (routing.Routing, error) {
		defer close(crout)

		dht, err := dht.New(
			ctx, h,
			dhtopts.Datastore(dstore),
			dhtopts.Validator(validator),
			dhtopts.Client(dhtclient),
		)

		if err != nil {
			return nil, err
		}

		drivers := []tinder.Driver{}

		if string(rdvpeer) != "" {
			// @FIXME(gfanton): use rand as argument
			rdvClient := tinder.NewRendezvousDiscovery(logger, h, rdvpeer, rand.New(rand.NewSource(rand.Int63())))
			drivers = append(drivers, rdvClient)
		}

		tinderRouting := tinder.NewRouting(logger, dht, drivers...)
		crout <- &RoutingOut{dht, tinderRouting}

		return tinderRouting, nil
	}, crout
}
