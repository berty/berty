package ipfsutil

import (
	"context"

	"berty.tech/berty/v2/go/internal/config"
	"github.com/ipfs/go-ipfs/commands"
	oldcmds "github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	corehttp "github.com/ipfs/go-ipfs/core/corehttp"
)

// TODO(@D4ryl00) get the actal api address from the ipfs node
var DefaultAPIAddrs = config.BertyMobile.DefaultAPIAddrs

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(ctx context.Context, node *core.IpfsNode) error {
	// mandatory for the IPFS API server
	cctx := commands.Context{
		// http handler requires it
		ReqLog: &oldcmds.ReqLog{},
		// the node is already construt so we pass it
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var opts = []corehttp.ServeOption{
		corehttp.MetricsCollectionOption("api"),
		corehttp.CommandsOption(cctx),
		// allow redirections from the http://{apiAddr}/webui to the actual webui address
		corehttp.WebUIOption,
		corehttp.GatewayOption(false, corehttp.WebUIPaths...),
	}

	// start the server in a new goroutine since it is not async
	go func(node *core.IpfsNode, DefaultAPIAddrs string, opts ...corehttp.ServeOption) {
		corehttp.ListenAndServe(node, DefaultAPIAddrs, opts...)
	}(node, DefaultAPIAddrs[0], opts...)

	return nil
}
