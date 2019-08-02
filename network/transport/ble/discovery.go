package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
)

// HandlePeerFound is called by the native driver when a new peer is found.
func HandlePeerFound(rID string, rAddr string) bool {
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

	// Checks if a listener is currently running.
	if gListener == nil || gListener.ctx.Err() != nil {
		logger().Error("discovery handle peer failed: listener not running")
		return false
	}

	// Ensures that gListener won't be unset until operations using it are finished
	gListener.inUse.Add(1)

	// Adds peer to peerstore.
	gListener.transport.host.Peerstore().AddAddr(rPID, rMa, pstore.TempAddrTTL)

	// Peer with lexicographical smallest address inits libp2p connection.
	if gListener.Addr().String() < rAddr {
		// Async connect so HandlePeerFound can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go gListener.transport.host.Connect(context.Background(), pstore.PeerInfo{
			ID:    rPID,
			Addrs: []ma.Multiaddr{rMa},
		})

		return true
	}

	// Peer with lexicographical biggest address accepts incoming connection.
	select {
	case gListener.inboundConnReq <- connReq{
		remoteMa:     rMa,
		remotePeerID: rPID,
	}:
		return true
	case <-gListener.ctx.Done():
		gListener.inUse.Done()
		return false
	}
}
