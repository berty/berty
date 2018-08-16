// This file include some helper/warper options for the Driver

package p2p

import (
	"fmt"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
)

var BootstrapIpfs = []string{
	"/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	"/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
	"/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
	"/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
	"/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
}

type Option func(*driverConfig) error

func (c *driverConfig) Apply(opts ...Option) error {
	for i, opt := range opts {
		if err := opt(c); err != nil {
			return fmt.Errorf("option %d failed: %s", i, err)
		}
	}

	return nil
}

func WithMDNS() Option {
	return func(dc *driverConfig) error {
		dc.enableMDNS = true
		return nil
	}
}

// WithDHTOptions creates a new DHT with the specified options.
func WithDHTOptions(opts ...dhtopt.Option) Option {
	return func(dc *driverConfig) error {
		dc.dhtOpts = opts
		return nil
	}
}

// WithDHTBoostrapConfig specifies parameters used bootstrapping the DHT.
func WithDHTBoostrapConfig(bc *dht.BootstrapConfig) Option {
	return func(dc *driverConfig) error {
		dc.dhtBoostrapConfig = *bc
		return nil
	}
}

// WithBootstrap configure boostrap connection
func WithBootstrap(addrs ...string) Option {
	return func(dc *driverConfig) error {
		dc.bootstrap = addrs
		return nil
	}
}

// WithBootstrapSync configure boostrap connection synchronously
func WithBootstrapSync(addrs ...string) Option {
	return func(dc *driverConfig) error {
		dc.bootstrapSync = true
		dc.bootstrap = addrs
		return nil
	}
}
