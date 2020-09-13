package mc

import (
	"fmt"

	"github.com/libp2p/go-libp2p-core/peer"
	pstore "github.com/libp2p/go-libp2p-core/peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// HandleFoundPeer is called by the native driver when a new peer is found.
func HandleFoundPeer(sRemotePID string) bool {
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		logger.Error("discovery handle peer failed: wrong remote peerID")
		return false
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/mc/%s", sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Checks if a listener is currently running.
	gLock.RLock()

	if gListener == nil || gListener.ctx.Err() != nil {
		gLock.RUnlock()
		logger.Error("discovery handle peer failed: listener not running")
		return false
	}

	// Get snapshot of gListener
	listener := gListener

	// unblock here to prevent blocking other APIs of Listener or Transport
	gLock.RUnlock()

	// Adds peer to peerstore.
	listener.transport.host.Peerstore().AddAddr(remotePID, remoteMa,
		pstore.TempAddrTTL)

	// Peer with lexicographical smallest peerID inits libp2p connection.
	if listener.Addr().String() < sRemotePID {
		// Async connect so HandleFoundPeer can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			// Need to use listener than gListener here to not have to check valid value of gListener
			err := listener.transport.host.Connect(listener.ctx, peer.AddrInfo{
				ID:    remotePID,
				Addrs: []ma.Multiaddr{remoteMa},
			})
			if err != nil {
				logger.Error("async connect", zap.Error(err))
			}
		}()

		return true
	}

	// Peer with lexicographical biggest peerID accepts incoming connection.
	// FIXME : consider to push this code in go routine to prevent blocking native driver
	select {
	case listener.inboundConnReq <- connReq{
		remoteMa:  remoteMa,
		remotePID: remotePID,
	}:
		return true
	case <-listener.ctx.Done():
		return false
	}
}
