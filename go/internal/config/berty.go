package config

import (
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	config "github.com/ipfs/go-ipfs-config"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
)

type BertyConfig struct {
	Bootstrap       []string
	RendezVousPeer  string
	DefaultMCBind   string
	Tracing         string
	DefaultAPIAddrs []string
	APIConfig       config.API
}

var BertyDev = &BertyConfig{
	Bootstrap:       ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer:  "/dnsaddr/rdvp.berty.io/ipfs/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
	DefaultMCBind:   mc.DefaultBind,
	Tracing:         "bacon.berty.io:8880",
	DefaultAPIAddrs: []string{"/ip4/127.0.0.1/tcp/5001"},
	APIConfig: config.API{
		HTTPHeaders: map[string][]string{
			"Access-Control-Allow-Origin":  []string{"http://127.0.0.1:5001", "https://webui.ipfs.io"},
			"Access-Control-Allow-Methods": []string{"PUT", "POST"},
		},
	},
}

var BertyMobile = &BertyConfig{
	Bootstrap:       ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer:  "/ip4/163.172.106.31/tcp/4040/p2p/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
	DefaultMCBind:   mc.DefaultBind,
	Tracing:         "bacon.berty.io:8880",
	DefaultAPIAddrs: []string{"/ip4/127.0.0.1/tcp/5001"},
	APIConfig: config.API{
		HTTPHeaders: map[string][]string{
			"Access-Control-Allow-Origin":  []string{"http://127.0.0.1:5001", "https://webui.ipfs.io"},
			"Access-Control-Allow-Methods": []string{"PUT", "POST"},
		},
	},
}
