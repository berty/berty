package ipfsutil

import (
	"context"
	"net"
	"net/http"

	"github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	corehttp "github.com/ipfs/go-ipfs/core/corehttp"
)

const apiAddr string = "/ip4/127.0.0.1/tcp/5001"
const gatewayAddr string = "/ip4/127.0.0.1/tcp/8080"

func defaultMux(path string) corehttp.ServeOption {
	return func(node *core.IpfsNode, _ net.Listener, mux *http.ServeMux) (*http.ServeMux, error) {
		mux.Handle(path, http.DefaultServeMux)
		return mux, nil
	}
}

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(ctx context.Context, node *core.IpfsNode) error {
	cctx := commands.Context{
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var opts = []corehttp.ServeOption{
		corehttp.MetricsCollectionOption("api"),
		corehttp.CheckVersionOption(),
		corehttp.CommandsOption(cctx),
		corehttp.WebUIOption,
		corehttp.GatewayOption(false, corehttp.WebUIPaths...),
		corehttp.VersionOption(),
		defaultMux("/debug/vars"),
		defaultMux("/debug/pprof/"),
		corehttp.MutexFractionOption("/debug/pprof-mutex/"),
		corehttp.MetricsScrapingOption("/debug/metrics/prometheus"),
		corehttp.LogOption(),
	}

	/*list, err := net.Listen("tcp", ":5001")
	if err != nil {
		return err
	}*/

	/*apiMaddr, err := ma.NewMultiaddr(apiAddr)
	if err != nil {
		return err
	}*/

	go func(node *core.IpfsNode, apiAddr string, opts ...corehttp.ServeOption) {
		corehttp.ListenAndServe(node, apiAddr, opts...)
	}(node, apiAddr, opts...)

	return nil
}

func ServeHTTPGateway(ctx context.Context, node *core.IpfsNode) error {
	cctx := commands.Context{
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var opts = []corehttp.ServeOption{
		corehttp.MetricsCollectionOption("gateway"),
		corehttp.CommandsROOption(cctx),
	}

	/*list, err := net.Listen("tcp", ":5001")
	if err != nil {
		return err
	}*/

	/*apiMaddr, err := ma.NewMultiaddr(apiAddr)
	if err != nil {
		return err
	}*/

	go func(node *core.IpfsNode, gatewayAddr string, opts ...corehttp.ServeOption) {
		corehttp.ListenAndServe(node, apiAddr, opts...)
	}(node, gatewayAddr, opts...)

	return nil
}
