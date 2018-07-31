package p2p

import (
	"context"

	"github.com/berty/berty/core/network"
	libp2p "github.com/libp2p/go-libp2p"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	dhtopt "github.com/libp2p/go-libp2p-kad-dht/opts"
)

// Driver is a network.Driver
var _ network.Driver = (*Driver)(nil)

type Option func(*DriverConfig) error

// DriverConfig to configure the driver
type DriverConfig struct {
	libp2pOpt []libp2p.Option

	// DHT Service
	dht               bool
	dhtClient         bool
	dhtOpts           []dhtopt.Option
	dhtBoostrapConfig dht.BootstrapConfig
}

// Driver
type Driver struct {
	host host.Host

	// services
	dht *dht.IpfsDHT
}

// New create a new driver
func New(ctx context.Context, cfg *DriverConfig) (network.Driver, error) {
	host, err := libp2p.New(ctx, cfg.libp2pOpt...)
	if err != nil {
		return nil, err
	}

	driver := Driver{
		host: host,
	}

	if cfg.dht {
		var err error
		driver.dht, err = dht.New(context.Background(), host, cfg.dhtOpts...)
		if err != nil {
			return nil, err
		}

		_, err = driver.dht.BootstrapWithConfig(cfg.dhtBoostrapConfig)
		if err != nil {
			host.Close()
			return nil, err
		}
	}
}
