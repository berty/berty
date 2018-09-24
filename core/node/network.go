package node

import (
	"context"

	"berty.tech/core/entity"
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
	// var devices []entity.Device
	// n.sql.Table("device").Select("id").Find(&devices)
	// for _, device := range devices {
	// 	if err := n.networkDriver.Join(context.Background(), device.ID); err != nil {
	// 		logger().Warn(err.Error())
	// 	}
	// }

	var conversations []entity.Conversation
	n.sql.Table("conversation").Select("id").Find(&conversations)
	for _, conversation := range conversations {
		if err := n.networkDriver.Join(context.Background(), conversation.ID); err != nil {
			logger().Warn(err.Error())
		}
	}
	return nil
}
