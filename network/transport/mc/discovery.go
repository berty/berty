package mc

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p-core/peer"
	pstore "github.com/libp2p/go-libp2p-core/peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// HandleFoundPeer is called by the native driver when a new peer is found.
func HandleFoundPeer(sRemotePID string) bool {
	remotePID, err := peer.IDB58Decode(sRemotePID)
	if err != nil {
		logger().Error("discovery handle peer failed: wrong remote peerID")
		return false
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/mc/%s", sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Checks if a listener is currently running.
	if gListener == nil || gListener.ctx.Err() != nil {
		logger().Error("discovery handle peer failed: listener not running", zap.Error(gListener.ctx.Err()))
		return false
	}

	// Ensures that gListener won't be unset until operations using it are finished
	gListener.inUse.Add(1)

	// Adds peer to peerstore.
	gListener.transport.host.Peerstore().AddAddr(remotePID, remoteMa,
		pstore.TempAddrTTL)

	// Peer with lexicographical smallest peerID inits libp2p connection.
	if gListener.Addr().String() < sRemotePID {
		// Async connect so HandleFoundPeer can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			err := gListener.transport.host.Connect(context.Background(), peer.AddrInfo{
				ID:    remotePID,
				Addrs: []ma.Multiaddr{remoteMa},
			})
			if err != nil {
				logger().Error("async connect", zap.Error(err))
			}
		}()

		return true
	}

	// Peer with lexicographical biggest peerID accepts incoming connection.
	select {
	case gListener.inboundConnReq <- connReq{
		remoteMa:  remoteMa,
		remotePID: remotePID,
	}:
		return true
	case <-gListener.ctx.Done():
		gListener.inUse.Done()
		return false
	}
}
