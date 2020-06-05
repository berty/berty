package ipfsutil

import (
	"net/http"

	ipfswebui "berty.tech/ipfs-webui-packed"
	"github.com/ipfs/go-ipfs/commands"
	oldcmds "github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/corehttp"
	"go.uber.org/zap"
)

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(logger *zap.Logger, node *core.IpfsNode, rootDirectory string) {
	// mandatory for the IPFS API server
	cctx := commands.Context{
		// needed for config access
		ConfigRoot: rootDirectory,
		// http handler requires it
		ReqLog: &oldcmds.ReqLog{},
		// the node is already construct so we pass it
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var APIAddr string
	cfg, err := node.Repo.Config()
	if err != nil || len(cfg.Addresses.API) == 0 {
		APIAddr = "ip4/127.0.0.1/tcp/5001"
	} else {
		APIAddr = cfg.Addresses.API[0]
	}

	var opts = []corehttp.ServeOption{
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
	}(node, APIAddr, opts...)
}

func ServeHTTPWebui(logger *zap.Logger) {
	dir := http.FileServer(ipfswebui.Dir())
	go func(dir http.Handler) {
		logger.Error(http.ListenAndServe(":3000", dir).Error())
	}(dir)
}
