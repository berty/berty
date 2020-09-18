package ipfsutil

import (
	"net/http"

	"github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	"github.com/ipfs/go-ipfs/core/corehttp"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	ipfswebui "berty.tech/ipfs-webui-packed"
)

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(logger *zap.Logger, node *core.IpfsNode, rootDirectory string) error {
	// mandatory for the IPFS API server
	cctx := commands.Context{
		// needed for config access
		ConfigRoot: rootDirectory,
		// http handler requires it
		ReqLog: &commands.ReqLog{},
		// the node is already construct so we pass it
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var APIAddr string
	cfg, err := node.Repo.Config()
	if err != nil || len(cfg.Addresses.API) == 0 {
		APIAddr = "/ip4/127.0.0.1/tcp/5001"
	} else {
		APIAddr = cfg.Addresses.API[0]
	}

	opts := []corehttp.ServeOption{
		corehttp.CommandsOption(cctx),
		// allow redirections from the http://{apiAddr}/webui to the actual webui address
		corehttp.WebUIOption,
		corehttp.GatewayOption(false, corehttp.WebUIPaths...),
	}

	addr, err := ma.NewMultiaddr(APIAddr)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	list, err := manet.Listen(addr)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	addr = list.Multiaddr()
	logger.Info("IPFS API server listening", zap.Stringer("addr", addr))

	// start the server in a new goroutine since it is not async
	go func(node *core.IpfsNode, opts ...corehttp.ServeOption) {
		err := corehttp.Serve(node, manet.NetListener(list), opts...)
		if err != nil {
			logger.Error("corehttp.ListenAndServe failed", zap.Error(err))
		}
	}(node, opts...)

	return nil
}

func ServeHTTPWebui(listenerAddr string, logger *zap.Logger) {
	if listenerAddr == "" {
		return
	}
	dir := http.FileServer(ipfswebui.Dir())
	go func(dir http.Handler) {
		logger.Named("ipfs.webui").Error(http.ListenAndServe(listenerAddr, dir).Error())
	}(dir)
}
