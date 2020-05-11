package ipfsutil

import (
	"context"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	ipfs_host "github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/libp2p/go-libp2p-core/protocol"
)

type ExtendedCoreAPI interface {
	ipfs_interface.CoreAPI

	NewStream(ctx context.Context, p peer.ID, pids ...protocol.ID) (network.Stream, error)
	SetStreamHandler(pid protocol.ID, handler network.StreamHandler)
	RemoveStreamHandler(pid protocol.ID)
}

type extendedCoreAPI struct {
	ipfs_interface.CoreAPI
	ipfs_host.Host
}

func NewExtendedCoreAPI(host ipfs_host.Host, api ipfs_interface.CoreAPI) ExtendedCoreAPI {
	return &extendedCoreAPI{
		CoreAPI: api,
		Host:    host,
	}
}
