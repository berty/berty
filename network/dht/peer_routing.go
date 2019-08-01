package dht

import (
	"context"
	"fmt"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

func FindPeer(ctx context.Context, d *dht.IpfsDHT, pid peer.ID) (pstore.PeerInfo, error) {
	start := time.Now()
	pi, err := d.FindPeer(ctx, pid)

	elapsed := time.Since(start)
	if err != nil {
		return pstore.PeerInfo{}, errors.Wrap(err, fmt.Sprintf("get value on DHT failed (%dms)", elapsed.Round(time.Millisecond)))
	}

	logger().Debug("find peer on dht", zap.Duration("get duration", elapsed), zap.String("peer", pid.Pretty()))
	return pi, nil
}
