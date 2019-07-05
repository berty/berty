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
	logger().Debug("HANDLEPEERFOUND CALLED WITH " + rID + " " + rAddr)
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

	return addToPeerstoreAndConnect(rPID, rMa, rAddr)
}

// addToPeerstoreAndConnect adds peer to peerstore and auto-connects to it.
func addToPeerstoreAndConnect(rPID peer.ID, rMa ma.Multiaddr, rAddr string) bool {
	logger().Debug("ADDPEERSTORE CALLED WITH " + rPID.Pretty() + " " + rAddr)
	// Adds peer to peerstore.
	gListener.transport.host.Peerstore().AddAddr(rPID, rMa, pstore.TempAddrTTL)

	// Peer with lexicographical smallest addr inits libp2p connection
	// while the other accepts it.
	if gListener.Addr().String() < rAddr {
		logger().Debug("ADDPEERSTORE CONNECT WITH " + rPID.Pretty() + " " + rAddr)
		err := gListener.transport.host.Connect(context.Background(), pstore.PeerInfo{
			ID:    rPID,
			Addrs: []ma.Multiaddr{rMa},
		})
		if err != nil {
			logger().Error("discovery auto connecting failed", zap.Error(err))
			return false
		} else {
			logger().Debug("discovery auto connecting succeeded")
			return true
		}
	} else {
		logger().Debug("discovery send request to listener for incoming conn")
		logger().Debug("ADDPEERSTORE ACCEPT WITH " + rPID.Pretty() + " " + rAddr)
		select {
		case <-gListener.ctx.Done():
			logger().Error("discovery auto accept failed: listener closed")
			return false
		case gListener.inboundConnReq <- connReq{
			remoteMa:     rMa,
			remotePeerID: rPID,
		}:
			logger().Debug("discovery auto accept succeeded")
			return true
		}
	}
}
