package config

import (
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
)

type BertyConfig struct {
	Bootstrap      []string
	RendezVousPeer string
	DefaultMCBind  string
	Tracing        string
}

var BertyDev = &BertyConfig{
	Bootstrap:      ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer: "/dnsaddr/rdvp.berty.io/ipfs/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
	DefaultMCBind:  mc.DefaultBind,
	Tracing:        "bacon.berty.io:8880",
}

var BertyMobile = &BertyConfig{
	Bootstrap:      ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer: "/ip4/163.172.106.31/tcp/4040/p2p/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p",
	DefaultMCBind:  mc.DefaultBind,
	Tracing:        "bacon.berty.io:8880",
}
