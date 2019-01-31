package p2p

import (
	"context"
	"strconv"
	"time"

	host "github.com/libp2p/go-libp2p-host"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
)

func CountConnectedRelays(relayMap map[peer.ID]bool, host host.Host) int {
	connectedRelays := 0

	for relay := range relayMap {
		if host.Network().Connectedness(relay) == inet.Connected {
			connectedRelays++
		}
	}

	return connectedRelays
}

func ReconnectToRelays(relayMap map[peer.ID]bool, host host.Host, limit int) int {
	connectedRelays := 0

	for relay := range relayMap {
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

func WatchRelayDisconnection(relayMap map[peer.ID]bool, host host.Host, shutdown chan struct{}) {
	go func() {
		for {
			if CountConnectedRelays(relayMap, host) == 0 {
				logger().Warn("watcher: no relay connected, try to reconnect")
				reconnected := ReconnectToRelays(relayMap, host, 10)
				if reconnected > 0 {
					logger().Debug("watcher: reconnection succeeded with " + strconv.Itoa(reconnected) + " relays")
				}
			} else {
				logger().Debug("watcher: relay connected, everything fine")
			}
			select {
			case <-time.After(5 * time.Second):
				continue
			case <-shutdown:
				logger().Debug("driver shutdown: relay connection watcher ended")
				return
			}
		}
	}()
}
