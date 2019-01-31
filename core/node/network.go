package node

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
	"go.uber.org/zap"
)

func WithNetworkDriver(driver network.Driver) NewNodeOption {
	return func(n *Node) {
		n.networkDriver = driver
	}
}

func WithNetworkMetrics(metrics network.Metrics) NewNodeOption {
	return func(n *Node) {
		n.networkMetrics = metrics
	}
}

func (n *Node) UseNetworkMetrics(ctx context.Context, metrics network.Metrics) {
	tracer := tracing.EnterFunc(ctx, metrics)
	defer tracer.Finish()

	n.networkMetrics = metrics
}

func (n *Node) UseNetworkDriver(ctx context.Context, driver network.Driver) error {
	tracer := tracing.EnterFunc(ctx, driver)
	defer tracer.Finish()
	ctx = tracer.Context()

	// FIXME: use a locking system

	n.networkDriver = driver
	// configure network
	n.networkDriver.OnEnvelopeHandler(n.HandleEnvelope)
	if err := n.networkDriver.Join(ctx, n.UserID()); err != nil {
		logger().Warn("failed to join user channel",
			zap.String("id", n.UserID()),
			zap.Error(err),
		)
	}

	// FIXME: subscribe to every owned device IDs
	// var devices []entity.Device
	// n.sql.Table("device").Select("id").Find(&devices)
	// for _, device := range devices {
	// 	if err := n.networkDriver.Join(ctx, device.ID); err != nil {
	// 		logger().Warn(err.Error())
	// 	}
	// }

	var conversations []entity.Conversation
	sql := n.sql(ctx)
	sql.Table("conversation").Select("id").Find(&conversations)
	for _, conversation := range conversations {
		if err := n.networkDriver.Join(ctx, conversation.ID); err != nil {
			logger().Warn(err.Error())
		}
	}
	return nil
}
