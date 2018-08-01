package p2p

import (
	"fmt"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
)

type Option func(*driverConfig) error

func (c *driverConfig) Apply(opts ...Option) error {
	for i, opt := range opts {
		if err := opt(c); err != nil {
			return fmt.Errorf("option %d failed: %s", i, err)
		}
	}

	return nil
}

// WithDHT creates a new DHT with the specified options.
// if BootstrapConfig, it will the default boostrap config
func WithDHTOptions(bc *dht.BootstrapConfig, opts ...dhtopt.Option) Option {
	return func(dc *driverConfig) error {
		dc.dhtOpts = opts

		if bc == nil {
			dc.dhtBoostrapConfig = *bc
		} else {
			dc.dhtBoostrapConfig = dht.DefaultBootstrapConfig
		}

		return nil
	}
}
