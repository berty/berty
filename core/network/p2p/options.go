package p2p

import (
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
)

// WithDHT creates a new DHT with the specified options.
// if BootstrapConfig, it will the default boostrap config
func WithDHT(bc *dht.BootstrapConfig, opts ...dhtopt.Option) Option {
	return func(dc *DriverConfig) error {
		dc.dht = true
		dc.dhtOpts = opts

		if bc == nil {
			dc.dhtBoostrapConfig = *bc
		} else {
			dc.dhtBoostrapConfig = dht.DefaultBootstrapConfig
		}

		return nil
	}
}
