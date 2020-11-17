package proximitytransport

import (
	"fmt"

	"github.com/libp2p/go-libp2p-core/peer"
	pstore "github.com/libp2p/go-libp2p-core/peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// HandleFoundPeer is called by the native driver when a new peer is found.
// Adds the peer in the PeerStore and initiates a connection with it
func (t *proximityTransport) HandleFoundPeer(sRemotePID string) bool {
	t.logger.Debug("HandleFoundPeer", zap.String("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		t.logger.Error("HandleFoundPeer: wrong remote peerID")
		return false
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/%s/%s", t.driver.ProtocolName(), sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Checks if a listener is currently running.
	t.lock.RLock()

	if t.listener == nil || t.listener.ctx.Err() != nil {
		t.lock.RUnlock()
		t.logger.Error("HandleFoundPeer: listener not running")
		return false
	}

	// Get snapshot of listener
	listener := t.listener

	// unblock here to prevent blocking other APIs of Listener or Transport
	t.lock.RUnlock()

	// Adds peer to peerstore.
	t.host.Peerstore().AddAddr(remotePID, remoteMa,
		pstore.TempAddrTTL)

	// Peer with lexicographical smallest peerID inits libp2p connection.
	if listener.Addr().String() < sRemotePID {
		t.logger.Debug("HandleFoundPeer: outgoing libp2p connection")
		// Async connect so HandleFoundPeer can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			// Need to use listener than t.listener here to not have to check valid value of t.listener
			err := t.host.Connect(listener.ctx, peer.AddrInfo{
				ID:    remotePID,
				Addrs: []ma.Multiaddr{remoteMa},
			})
			if err != nil {
				t.logger.Error("HandleFoundPeer: async connect error", zap.Error(err))
				t.host.Peerstore().SetAddr(remotePID, remoteMa, 0)
				t.driver.CloseConnWithPeer(sRemotePID)
			}
		}()

		return true
	}

	t.logger.Debug("HandleFoundPeer: incoming libp2p connection")
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

// HandleLostPeer is called by the native driver when the connection with the peer is lost.
// Closes connections with the peer.
func (t *proximityTransport) HandleLostPeer(sRemotePID string) {
	t.logger.Debug("HandleLostPeer", zap.String("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		t.logger.Error("HandleLostPeer: wrong remote peerID")
		return
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/%s/%s", t.driver.ProtocolName(), sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Remove peer's address to peerstore.
	t.host.Peerstore().SetAddr(remotePID, remoteMa, 0)
}
