package host

import (
	"context"

	pstore "github.com/libp2p/go-libp2p-peerstore"
	"go.uber.org/zap"
)

func (bh *BertyHost) HandlePeerFound(pi pstore.PeerInfo) {
	// try to connect with this new peer
	if err := bh.Connect(context.Background(), pi); err != nil {
		logger().Error("found a peer but unable to connect with", zap.String("ID", pi.ID.Pretty()), zap.Error(err))
	}
}
