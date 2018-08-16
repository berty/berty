package node

import "berty.tech/core/network"

func WithNetworkDriver(driver network.Driver) NewNodeOption {
	return func(n *Node) {
		n.networkDriver = driver
	}
}
