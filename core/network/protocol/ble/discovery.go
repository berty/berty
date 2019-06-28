package ble

import (
	"context"
	"fmt"

	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

var disc *discovery

type discovery struct {
	transport *Transport
}

func startDiscovery(t *Transport) {
	disc = &discovery{
		transport: t,
	}

	// Disable discovery if listener is closed
	go func() {
		<-t.listener.closer
		disc = nil
	}()
}

// Handler called by the native driver when a new peer is found
func HandlePeerFound(rID string, rAddr string) bool {
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

	go addToPeerStoreAndConnect(rPID, rMa, rAddr)

	return true
}

func addToPeerStoreAndConnect(rPID peer.ID, rMa ma.Multiaddr, rAddr string) {
	// Add peer to peerstore
	disc.transport.host.Peerstore().AddAddr(rPID, rMa, pstore.TempAddrTTL)

	// Peer with smallest addr (lexicographical order) init libp2p connect while
	// the other wait for incoming connection
	if disc.transport.listener.Addr().String() < rAddr {
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
		logger().Debug("discovery send info to listener for incoming conn request")
		disc.transport.listener.incomingConnReq <- connReq{
			remoteAddr:   rAddr,
			remoteMa:     rMa,
			remotePeerID: rPID,
		}
	}
}
