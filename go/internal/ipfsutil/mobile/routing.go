package node

import (
	"context"
	"fmt"

	ds "github.com/ipfs/go-datastore"
	ipfs_p2p "github.com/ipfs/kubo/core/node/libp2p"
	p2p_record "github.com/libp2p/go-libp2p-record"
	p2p_host "github.com/libp2p/go-libp2p/core/host"
	p2p_peer "github.com/libp2p/go-libp2p/core/peer"
	p2p_routing "github.com/libp2p/go-libp2p/core/routing"
)

type RoutingConfigFunc func(p2p_host.Host, p2p_routing.Routing) error

type RoutingConfig struct {
	ConfigFunc RoutingConfigFunc
}

func NewRoutingConfigOption(ro ipfs_p2p.RoutingOption, rc *RoutingConfig) ipfs_p2p.RoutingOption {
	return func(
		ctx context.Context,
		host p2p_host.Host,
		dstore ds.Batching,
		validator p2p_record.Validator,
		bootstrapPeers ...p2p_peer.AddrInfo,
	) (p2p_routing.Routing, error) {
		routing, err := ro(ctx, host, dstore, validator, bootstrapPeers...)
		if err != nil {
			return nil, err
		}

		if rc.ConfigFunc != nil {
			if err := rc.ConfigFunc(host, routing); err != nil {
				return nil, fmt.Errorf("failed to config routing: %w", err)
			}
		}

		return routing, nil
	}
}
