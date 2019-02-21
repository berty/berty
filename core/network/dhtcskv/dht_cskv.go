package dhtcskv

import (
	"context"
	"time"

	ds "github.com/ipfs/go-datastore"
	host "github.com/libp2p/go-libp2p-host"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	opts "github.com/libp2p/go-libp2p-kad-dht/opts"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var defaultClientConfig = dht.BootstrapConfig{
	Queries: 3,
	Period:  1 * time.Minute,
	Timeout: 10 * time.Second,
}

var defaultServerConfig = dht.BootstrapConfig{
	Queries: 10,
	Period:  1 * time.Minute,
	Timeout: 40 * time.Second,
}

func New(ctx context.Context, host host.Host, server bool, config dht.BootstrapConfig) (*dht.IpfsDHT, error) {
	datastore := ds.NewMapDatastore()

	if config.Queries == 0 {
		if server {
			config = defaultServerConfig
		} else {
			config = defaultClientConfig
		}
	}

	dhtkv, err := dht.New(
		ctx,
		host,
		opts.Client(!server),
		opts.NamespacedValidator("bertyTranslate", translateValidator{}),
		// Other namespaces
		opts.Datastore(datastore),
	)
	if err != nil {
		return nil, errors.Wrap(err, "dht-cskv init failed")
	}

	if err := dhtkv.BootstrapWithConfig(ctx, config); err != nil {
		return nil, errors.Wrap(err, "dht-cskv init failed")
	}

	return dhtkv, nil
}

func PutValue(ctx context.Context, dhtCskv *dht.IpfsDHT, key string, value []byte) error {
	// Get time duration for putting a record
	start := time.Now()

	err := dhtCskv.PutValue(ctx, key, value)
	if err != nil {
		return errors.Wrap(err, "put value on DHT-CSKV failed")
	}

	elapsed := time.Now().Sub(start).Round(time.Millisecond)
	logger().Debug("put value on dht-cskv", zap.Duration("time elapsed", elapsed), zap.String("key", key))

	return nil
}

func GetValue(ctx context.Context, dhtCskv *dht.IpfsDHT, key string) ([]byte, error) {
	// Get time duration for getting a record
	start := time.Now()

	value, err := dhtCskv.GetValue(ctx, key)
	if err != nil {
		return []byte{}, errors.Wrap(err, "get value on DHT-CSKV failed")
	}

	elapsed := time.Now().Sub(start).Round(time.Millisecond)
	logger().Debug("get value on dht-cskv", zap.Duration("time elapsed", elapsed), zap.String("key", key))

	return value, nil
}
