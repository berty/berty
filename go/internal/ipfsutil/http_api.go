package ipfsutil

import (
	"context"

	"github.com/ipfs/go-ipfs/commands"
	oldcmds "github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	corehttp "github.com/ipfs/go-ipfs/core/corehttp"
)

// TODO(@D4ryl00) get the actal api address from the ipfs node
const apiAddr string = "/ip4/127.0.0.1/tcp/5001"

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(ctx context.Context, node *core.IpfsNode) error {
	cctx := commands.Context{
		ReqLog: &oldcmds.ReqLog{},
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var opts = []corehttp.ServeOption{
		corehttp.MetricsCollectionOption("api"),
		corehttp.CommandsOption(cctx),
		corehttp.WebUIOption,
		corehttp.GatewayOption(false, corehttp.WebUIPaths...),
	}

	go func(node *core.IpfsNode, apiAddr string, opts ...corehttp.ServeOption) {
		corehttp.ListenAndServe(node, apiAddr, opts...)
	}(node, apiAddr, opts...)

	return nil
}
