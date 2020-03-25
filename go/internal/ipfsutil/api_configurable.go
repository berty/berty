package ipfsutil

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_coreapi "github.com/ipfs/go-ipfs/core/coreapi"
	ipfs_node "github.com/ipfs/go-ipfs/core/node"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type NewAPIOption func(context.Context, *ipfs_core.IpfsNode, ipfs_interface.CoreAPI) error

// NewConfigurableCoreAPI returns an IPFS CoreAPI from a provided ipfs_node.BuildCfg
func NewConfigurableCoreAPI(ctx context.Context, cfg *ipfs_node.BuildCfg, options ...NewAPIOption) (ipfs_interface.CoreAPI, *ipfs_core.IpfsNode, error) {
	node, err := ipfs_core.NewNode(ctx, cfg)
	if err != nil {
		return nil, nil, errcode.TODO.Wrap(err)
	}

	api, err := ipfs_coreapi.NewCoreAPI(node)
	if err != nil {
		node.Close()
		return nil, nil, errcode.TODO.Wrap(err)
	}

	for _, o := range options {
		err := o(ctx, node, api)
		if err != nil {
			node.Close()
			return nil, nil, err
		}
	}

	return api, node, nil
}
