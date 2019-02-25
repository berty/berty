package dhtcskv

import (
	"context"
	"fmt"
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
	var datastore ds.Batching

	if server {
		datastore = ds.NewLogDatastore(ds.NewMapDatastore(), "DHT_datastore")
		if config.Queries == 0 {
			config = defaultServerConfig
		}
	} else {
		datastore = ds.NewMapDatastore()
		if config.Queries == 0 {
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
	elapsed := time.Now().Sub(start).Round(time.Millisecond)

	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("put value on DHT-CSKV failed (%dms)", elapsed))
	}

	logger().Debug("put value on dht-cskv", zap.Duration("put duration", elapsed), zap.String("key", key))

	return nil
}

func GetValue(ctx context.Context, dhtCskv *dht.IpfsDHT, key string) ([]byte, error) {
	// Get time duration for getting a record
	start := time.Now()
	value, err := dhtCskv.GetValue(ctx, key)
	elapsed := time.Now().Sub(start).Round(time.Millisecond)

	if err != nil {
		return []byte{}, errors.Wrap(err, fmt.Sprintf("get value on DHT-CSKV failed (%dms)", elapsed))
	}

	logger().Debug("get value on dht-cskv", zap.Duration("get duration", elapsed), zap.String("key", key))

	return value, nil
}
