package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// This global var is set if service is running.
var disc *discovery

// discovery needs transport to access host (add to peerstore / connect)
// and listener (send incoming conn request to Accept()).
type discovery struct {
	transport *Transport
}

// HandlePeerFound is called by the native driver when a new peer is found.
func HandlePeerFound(rID string, rAddr string) bool {
	logger().Debug("HANDLEPEERFOUND CALLED WITH " + rID + " " + rAddr)
	// Checks if discovery service is running.
	if disc == nil {
		logger().Error("discovery handle peer failed: discovery service not started")
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

	go addToPeerstoreAndConnect(rPID, rMa, rAddr)

	return true
}

// addToPeerstoreAndConnect adds peer to peerstore and auto-connects to it.
func addToPeerstoreAndConnect(rPID peer.ID, rMa ma.Multiaddr, rAddr string) {
	logger().Debug("ADDPEERSTORE CALLED WITH " + rPID.Pretty() + " " + rAddr)
	// Adds peer to peerstore.
	disc.transport.host.Peerstore().AddAddr(rPID, rMa, pstore.TempAddrTTL)

	// Peer with lexicographical smallest addr inits libp2p connection
	// while the other accepts it.
	if disc.transport.listener.Addr().String() < rAddr {
		logger().Debug("ADDPEERSTORE CONNECT WITH " + rPID.Pretty() + " " + rAddr)
		err := disc.transport.host.Connect(context.Background(), pstore.PeerInfo{
			ID:    rPID,
			Addrs: []ma.Multiaddr{rMa},
		})
		if err != nil {
			logger().Error("discovery auto connecting failed", zap.Error(err))
		} else {
			logger().Debug("discovery auto connecting succeeded")
		}
	} else {
		logger().Debug("discovery send request to listener for incoming conn")
		logger().Debug("ADDPEERSTORE ACCEPT WITH " + rPID.Pretty() + " " + rAddr)
		disc.transport.listener.inboundConnReq <- connReq{
			remoteMa:     rMa,
			remotePeerID: rPID,
		}
	}
}
