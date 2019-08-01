package dht

import (
	"context"
	"fmt"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// @TODO: increase this value when will have a bigger network
var DefaultQuorum = dht.Quorum(2)

func PutValue(ctx context.Context, d *dht.IpfsDHT, key string, value []byte) error {
	// Get time duration for putting a record
	start := time.Now()
	err := d.PutValue(ctx, key, value, DefaultQuorum)

	elapsed := time.Since(start)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("put value on DHT failed (%dms) on `%s`",
			elapsed.Round(time.Millisecond), key))
	}

	logger().Debug("put value on dht", zap.Duration("put duration", elapsed), zap.String("key", key))
	return nil
}

func GetValue(ctx context.Context, d *dht.IpfsDHT, key string) ([]byte, error) {
	// Get time duration for getting a record
	start := time.Now()
	value, err := d.GetValue(ctx, key, DefaultQuorum)

	elapsed := time.Since(start)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf("get value on DHT failed (%dms) on `%s`",
			time.Since(start).Round(time.Millisecond), key))
	}

	logger().Debug("get value on dht", zap.Duration("get duration", elapsed), zap.String("key", key))
	return value, nil
}

func SearchValue(ctx context.Context, d *dht.IpfsDHT, key string) (<-chan []byte, error) {
	// Get time duration for searching a value
	start := time.Now()
	cvalues, err := d.SearchValue(ctx, key)
	if err != nil {
		return nil, errors.Wrap(err, fmt.Sprintf("search values on DHT failed (%dms) on `%s`",
			time.Since(start).Round(time.Millisecond), key))
	}

	out := make(chan []byte)
	go func() {
		for v := range cvalues {
			logger().Debug("found a provider",
				zap.Duration("get duration", time.Since(start)),
				zap.String("key", key))
			out <- v
		}

		close(out)
		logger().Debug("search value (async) on DHT finished",
			zap.Duration("get duration", time.Since(start)),
			zap.String("key", key))
	}()

	return out, nil
}
