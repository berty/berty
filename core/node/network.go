package node

import (
	"context"

	"berty.tech/core/network"
	"go.uber.org/zap"
)

func WithNetworkDriver(driver network.Driver) NewNodeOption {
	return func(n *Node) {
		n.networkDriver = driver
	}
}

func (n *Node) UseNetworkDriver(driver network.Driver) error {
	// FIXME: use a locking system

	n.networkDriver = driver

	// configure network
	n.networkDriver.OnEnvelopeHandler(n.HandleEnvelope)
	if err := n.networkDriver.Join(context.Background(), n.UserID()); err != nil {
		logger().Warn("failed to join user channel",
			zap.String("id", n.UserID()),
			zap.Error(err),
		)
	}
	// FIXME: subscribe to every owned device IDs
	// FIXME: subscribe to every joined conversations
	return nil
}
