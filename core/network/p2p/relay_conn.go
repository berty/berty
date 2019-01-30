package p2p

import (
	"context"

	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
)

func getRelaysFromPeerstore(host host.Host) peer.IDSlice {
	var relays peer.IDSlice
	peers := host.Peerstore().Peers()

	for _, peer := range peers {
		tags := host.ConnManager().GetTagInfo(peer)
		if tags != nil {
			val, exist := tags.Tags["relay-hop"]
			if exist && val == 2 {
				relays = append(relays, peer)
			}
		}
	}

	return relays
}

func CountConnectedRelays(host host.Host) int {
	relays := getRelaysFromPeerstore(host)
	connectedRelays := 0

	for _, relay := range relays {
		if host.Network().Connectedness(relay) == inet.Connected {
			connectedRelays++
		}
	}

	return connectedRelays
}

func ReconnectToRelays(host host.Host, limit int) int {
	connectedRelays := 0
	relays := getRelaysFromPeerstore(host)

	for _, relay := range relays {
		relayInfo := host.Peerstore().PeerInfo(relay)
		if host.Connect(context.Background(), relayInfo) == nil {
			connectedRelays++
			if connectedRelays == limit {
				break
			}
		}
	}

	return connectedRelays
}
