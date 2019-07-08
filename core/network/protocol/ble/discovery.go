package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// HandlePeerFound is called by the native driver when a new peer is found.
func HandlePeerFound(rID string, rAddr string) bool {
	// Checks if a listener is currently running.
	if gListener == nil || gListener.ctx.Err() != nil {
		logger().Error("discovery handle peer failed: listener not running")
		return false
	}

	rPID, err := peer.IDB58Decode(rID)
	if err != nil {
		logger().Error("discovery handle peer failed: wrong remote peerID")
		return false
	}

	rMa, err := ma.NewMultiaddr(fmt.Sprintf("/ble/%s", rAddr))
	if err != nil {
		logger().Error("discovery handle peer failed: wrong remote multiaddr")
		return false
	}

	addToPeerstoreAndConnect(rPID, rMa, rAddr)

	return true
}

// addToPeerstoreAndConnect adds peer to peerstore and auto-connects to it.
func addToPeerstoreAndConnect(rPID peer.ID, rMa ma.Multiaddr, rAddr string) {
	// Adds peer to peerstore.
	gListener.transport.host.Peerstore().AddAddr(rPID, rMa, pstore.TempAddrTTL)

	// Peer with lexicographical smallest addr inits libp2p connection
	// while the other accepts it.
	if gListener.Addr().String() < rAddr {
		// Async so HandlePeerFound can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			err := gListener.transport.host.Connect(context.Background(), pstore.PeerInfo{
				ID:    rPID,
				Addrs: []ma.Multiaddr{rMa},
			})
			if err != nil {
				logger().Error("discovery auto connecting failed", zap.Error(err))
			} else {
				logger().Debug("discovery auto connecting succeeded")
			}
		}()
	} else {
		logger().Debug("discovery send request to listener for incoming conn")
		select {
		case <-gListener.ctx.Done():
			logger().Error("discovery auto accept failed: listener closed")
		case gListener.inboundConnReq <- connReq{
			remoteMa:     rMa,
			remotePeerID: rPID,
		}:
			logger().Debug("discovery auto accept request sent")
			return
		}
	}
}
