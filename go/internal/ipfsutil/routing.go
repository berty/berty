package ipfsutil

import (
	"context"
	"math/rand"

	tinder "berty.tech/berty/v2/go/internal/tinder"
	datastore "github.com/ipfs/go-datastore"
	ipfs_p2p "github.com/ipfs/go-ipfs/core/node/libp2p"
	host "github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/peerstore"
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

func NewTinderRouting(logger *zap.Logger, rdvpeer *peer.AddrInfo, dhtclient bool, localDiscovery bool) (ipfs_p2p.RoutingOption, <-chan *RoutingOut) {
	crout := make(chan *RoutingOut, 1)
	return func(ctx context.Context, h host.Host, dstore datastore.Batching, validator record.Validator, bootstrapPeers ...peer.AddrInfo) (routing.Routing, error) {
		defer close(crout)

		dht, err := dht.New(
			ctx, h,
			dht.Concurrency(3),
			dht.Datastore(dstore),
			dht.Validator(validator),
			dht.BootstrapPeers(bootstrapPeers...),
			dhtopts.Client(dhtclient),
		)

		if err != nil {
			return nil, err
		}

		drivers := []tinder.Driver{}

		if rdvpeer != nil {
			h.Peerstore().AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
			// @FIXME(gfanton): use rand as argument
			rdvClient := tinder.NewRendezvousDiscovery(logger, h, rdvpeer.ID, rand.New(rand.NewSource(rand.Int63())))
			drivers = append(drivers, rdvClient)
		}

		if localDiscovery {
			localDiscovery := tinder.NewLocalDiscovery(logger, h, rand.New(rand.NewSource(rand.Int63())))
			drivers = append(drivers, localDiscovery)
		}

		tinderRouting := tinder.NewRouting(logger, "dht", dht, drivers...)
		crout <- &RoutingOut{dht, tinderRouting}

		return tinderRouting, nil
	}, crout
}
