package ipfsutil

import (
	"context"

	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	peer "github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p/p2p/discovery/mdns"
)

type DiscoveryNotifee struct {
	api ipfs_interface.CoreAPI
	ctx context.Context
}

func (n *DiscoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	if err := n.api.Swarm().Connect(n.ctx, pi); err != nil {
		_ = err
		// TODO: log
		// println("HandlePeerFound: Unable to connect to peer", err.Error())
	}
}

func OptionMDNSDiscovery(ctx context.Context, node *ipfs_core.IpfsNode, api ipfs_interface.CoreAPI) error {
	s := discovery.NewMdnsService(node.PeerHost, "berty")
	n := &DiscoveryNotifee{api: api, ctx: ctx}
	s.RegisterNotifee(n)

	return nil
}
