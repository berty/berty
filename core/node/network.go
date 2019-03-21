package node

import (
	"context"
	"fmt"

	"berty.tech/core/network"
	network_metric "berty.tech/core/network/metric"
	"berty.tech/core/pkg/tracing"
)

func WithNetworkDriver(driver network.Driver) NewNodeOption {
	return func(n *Node) {
		n.networkDriver = driver
	}
}

func WithNetworkMetric(metrics network_metric.Metric) NewNodeOption {
	return func(n *Node) {
		n.networkMetric = metrics
	}
}

func (n *Node) UseNetworkMetric(ctx context.Context, metrics network_metric.Metric) {
	tracer := tracing.EnterFunc(ctx, metrics)
	defer tracer.Finish()

	n.networkMetric = metrics
}

func (n *Node) UseNetworkDriver(ctx context.Context, driver network.Driver) error {
	tracer := tracing.EnterFunc(ctx, driver)
	defer tracer.Finish()
	ctx = tracer.Context()

	// FIXME: use a locking system
	n.networkDriver = driver

	// configure network
	n.networkDriver.OnEnvelopeHandler(n.HandleEnvelope)

	logger().Debug(fmt.Sprintf("NETWORK ADDR NODE %p %+v", n.networkDriver, n.networkDriver))

	_ = n.networkDriver.Join(ctx, n.UserID())

	// FIXME: subscribe to every owned device IDs
	// var devices []entity.Device
	// n.sql.Table("device").Select("id").Find(&devices)
	// for _, device := range devices {
	// 	if err := n.networkDriver.Join(ctx, device.ID); err != nil {
	// 		logger().Warn(err.Error())
	// 	}
	// }

	// var conversations []entity.Conversation
	// sql := n.sql(ctx)
	// sql.Table("conversation").Select("id").Find(&conversations)
	// for _, conversation := range conversations {
	// 	if err := n.networkDriver.Join(ctx, conversation.ID); err != nil {
	// 		logger().Warn(err.Error())
	// 	}
	// }

	return nil
}
