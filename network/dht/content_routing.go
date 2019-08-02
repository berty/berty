package dht

import (
	"context"
	"fmt"
	"time"

	cid "github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func Provide(ctx context.Context, d *dht.IpfsDHT, id cid.Cid, brdcst bool) error {
	// Get time duration to provide
	start := time.Now()
	err := d.Provide(ctx, id, brdcst)

	elapsed := time.Since(start)
	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("provide on DHT failed (%dms)", elapsed.Round(time.Millisecond)))
	}

	logger().Debug("provide on dht", zap.Duration("get duration", elapsed), zap.String("cid", id.String()))
	return nil
}

func FindProvidersAsync(ctx context.Context, d *dht.IpfsDHT, id cid.Cid, n int) <-chan pstore.PeerInfo {
	// Get time duration to find a provider
	start := time.Now()
	cvalues := d.FindProvidersAsync(ctx, id, n)
	out := make(chan pstore.PeerInfo)

	go func() {
		for v := range cvalues {
			logger().Debug("found a provider",
				zap.Duration("get duration", time.Since(start)),
				zap.String("cid", id.String()),
				zap.String("peer", v.ID.String()))

			out <- v
		}

		close(out)
		logger().Debug("find provider (async) on DHT finished",
			zap.Duration("get duration", time.Since(start)),
			zap.String("cid", id.String()))
	}()

	return out
}
