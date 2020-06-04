package ipfsutil

import (
	"net/http"

	"berty.tech/berty/v2/go/internal/config"
	ipfswebui "berty.tech/ipfs-webui-packed"
	"github.com/ipfs/go-ipfs/commands"
	oldcmds "github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/corehttp"
	"go.uber.org/zap"
)

var DefaultAPIAddrs = config.BertyMobile.DefaultAPIAddrs // TODO(@D4ryl00) get the actal api address from the ipfs node

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(logger *zap.Logger, node *core.IpfsNode) {
	// mandatory for the IPFS API server
	cctx := commands.Context{
		// http handler requires it
		ReqLog: &oldcmds.ReqLog{},
		// the node is already construct so we pass it
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
	go func(node *core.IpfsNode, apiAddr string, opts ...corehttp.ServeOption) {
		err := corehttp.ListenAndServe(node, apiAddr, opts...)
		if err != nil {
			logger.Error("corehttp.ListenAndServe failed", zap.Error(err))
		}
	}(node, DefaultAPIAddrs[0], opts...)
}

func ServeHTTPWebui(logger *zap.Logger) {
	dir := http.FileServer(ipfswebui.Dir())
	go func(dir http.Handler) {
		logger.Error(http.ListenAndServe(":3000", dir).Error())
	}(dir)
}
