package config

import (
	ipfs_cfg "github.com/ipfs/go-ipfs-config"
)

type BertyConfig struct {
	Bootstrap      []string
	RendezVousPeer string
}

var BertyDev = &BertyConfig{
	Bootstrap:      ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer: "/dnsaddr/rdvp.berty.io/ipfs/QmTo3RS6Uc8aCS5Cxx8EBHkNCe4C7vKRanbMEboxkA92Cn",
}

var BertyMobile = &BertyConfig{
	Bootstrap:      ipfs_cfg.DefaultBootstrapAddresses,
	RendezVousPeer: "/ip4/167.99.223.55/tcp/4040/p2p/QmTo3RS6Uc8aCS5Cxx8EBHkNCe4C7vKRanbMEboxkA92Cn",
}
