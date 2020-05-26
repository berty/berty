package ipfsutil

import (
	"context"
	"net"

	config "github.com/ipfs/go-ipfs-config"
	"github.com/ipfs/go-ipfs/commands"
	"github.com/ipfs/go-ipfs/core"
	corehttp "github.com/ipfs/go-ipfs/core/corehttp"
)

// ServeHTTPApi collects options, creates listener, prints status message and starts serving requests
func ServeHTTPApi(ctx context.Context, node *core.IpfsNode) error {
	/*cfg, err := cctx.GetConfig()
	if err != nil {
		return nil, fmt.Errorf("serveHTTPApi: GetConfig() failed: %s", err)
	}

	listeners, err := sockets.TakeListeners("tech.berty.api")
	if err != nil {
		return nil, fmt.Errorf("serveHTTPApi: socket activation failed: %s", err)
	}

	apiAddrs := make([]string, 0, 2)
	apiAddr, _ := req.Options[commands.ApiOption].(string)
	if apiAddr == "" {
		apiAddrs = cfg.Addresses.API
	} else {
		apiAddrs = append(apiAddrs, apiAddr)
	}

	listenerAddrs := make(map[string]bool, len(listeners))
	for _, listener := range listeners {
		listenerAddrs[string(listener.Multiaddr().Bytes())] = true
	}

	for _, addr := range apiAddrs {
		apiMaddr, err := ma.NewMultiaddr(addr)
		if err != nil {
			return nil, fmt.Errorf("serveHTTPApi: invalid API address: %q (err: %s)", addr, err)
		}
		if listenerAddrs[string(apiMaddr.Bytes())] {
			continue
		}

		apiLis, err := manet.Listen(apiMaddr)
		if err != nil {
			return nil, fmt.Errorf("serveHTTPApi: manet.Listen(%s) failed: %s", apiMaddr, err)
		}

		listenerAddrs[string(apiMaddr.Bytes())] = true
		listeners = append(listeners, apiLis)
	}

	for _, listener := range listeners {
		// we might have listened to /tcp/0 - let's see what we are listing on
		fmt.Printf("API server listening on %s\n", listener.Multiaddr())
		// Browsers require TCP.
		switch listener.Addr().Network() {
		case "tcp", "tcp4", "tcp6":
			fmt.Printf("WebUI: http://%s/webui\n", listener.Addr())
		}
	}

	if len(cfg.Gateway.RootRedirect) > 0 {
		opts = append(opts, corehttp.RedirectOption("", cfg.Gateway.RootRedirect))
	}

	node, err := cctx.ConstructNode()
	if err != nil {
		return nil, fmt.Errorf("serveHTTPApi: ConstructNode() failed: %s", err)
	}

	if err := node.Repo.SetAPIAddr(listeners[0].Multiaddr()); err != nil {
		return nil, fmt.Errorf("serveHTTPApi: SetAPIAddr() failed: %s", err)
	}

	errc := make(chan error)
	var wg sync.WaitGroup
	for _, apiLis := range listeners {
		wg.Add(1)
		go func(lis manet.Listener) {
			defer wg.Done()
			errc <- corehttp.Serve(node, manet.NetListener(lis), opts...)
		}(apiLis)
	}

	go func() {
		wg.Wait()
		close(errc)
	}()

	return errc, nil
	*/

	cctx := commands.Context{
		LoadConfig: func(path string) (*config.Config, error) {
			return &config.Config{
				API: config.API{
					HTTPHeaders: map[string][]string{
						"Access-Control-Allow-Origin":  []string{"http://127.0.0.1:5001", "https://webui.ipfs.io"},
						"Access-Control-Allow-Methods": []string{"PUT", "POST"},
					},
				},
			}, nil
		},
		ConstructNode: func() (*core.IpfsNode, error) {
			return node, nil
		},
	}

	var opts = []corehttp.ServeOption{
		corehttp.MetricsCollectionOption("api"),
		corehttp.CommandsOption(cctx),
		corehttp.WebUIOption,
	}

	list, err := net.Listen("tcp", ":5001")
	if err != nil {
		return err
	}

	if err := corehttp.Serve(node, list, opts...); err != nil {
		return err
	}

	return nil
}
