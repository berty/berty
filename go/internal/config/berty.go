package config

import (
	config "github.com/ipfs/go-ipfs-config"

	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
)

type BertyConfig struct {
	Bootstrap         []string
	RendezVousPeers   []string
	DefaultSwarmAddrs []string
	Tracing           string
	DefaultAPIAddrs   []string
	APIConfig         config.API
}

var BertyDev = &BertyConfig{
	Bootstrap: config.DefaultBootstrapAddresses,
	RendezVousPeers: []string{
		"/dnsaddr/rdvp.berty.io/ipfs/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
		"/ip4/51.75.127.200/udp/4141/quic/p2p/12D3KooWRpyQpZtUmY5ZktEMgzuhNoWC1C9zokDjLVahNMy3g48u",
	},
	DefaultSwarmAddrs: []string{
		mc.DefaultBind,
		"/ip4/0.0.0.0/tcp/0",
		"/ip6/::/tcp/0",
		"/ip4/0.0.0.0/udp/0/quic",
		"/ip6/::/udp/0/quic",
	},
	Tracing: "jaeger.berty.io:8443",
	APIConfig: config.API{
		HTTPHeaders: map[string][]string{
			"Access-Control-Allow-Origin":  {"*"},
			"Access-Control-Allow-Methods": {"POST", "PUT"},
		},
	},
}

var BertyMobile = &BertyConfig{
	Bootstrap: config.DefaultBootstrapAddresses,
	RendezVousPeers: []string{
		"/ip4/163.172.106.31/tcp/4040/p2p/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
		"/ip4/51.75.127.200/udp/4141/quic/p2p/12D3KooWRpyQpZtUmY5ZktEMgzuhNoWC1C9zokDjLVahNMy3g48u",
	},
	DefaultSwarmAddrs: []string{
		mc.DefaultBind,
		"/ip4/0.0.0.0/tcp/0",
		"/ip6/::/tcp/0",
		"/ip4/0.0.0.0/udp/0/quic",
		"/ip6/::/udp/0/quic",
	},
	Tracing:         "jaeger.berty.io:8443",
	DefaultAPIAddrs: []string{"/ip4/127.0.0.1/tcp/5001"},
	APIConfig: config.API{
		HTTPHeaders: map[string][]string{
			"Access-Control-Allow-Origin":  {"*"},
			"Access-Control-Allow-Methods": {"POST", "PUT"},
		},
	},
}
