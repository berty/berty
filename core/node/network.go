package node

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/tracing"
	"berty.tech/network"
	network_metric "berty.tech/network/metric"
	berty_net "berty.tech/network/protocol/berty"
	"github.com/gogo/protobuf/proto"
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

func (n *Node) HandleMessage(msg *berty_net.Message, meta *berty_net.ConnMetadata) {
	ctx := context.TODO()

	tracer := tracing.EnterFunc(ctx, msg, meta)
	defer tracer.Finish()
	ctx = tracer.Context()

	input := &entity.Envelope{}
	if err := proto.Unmarshal(msg.Data, input); err != nil {
		logger().Error("failed to unmarshal envelope")
		return
	}

	n.HandleEnvelope(ctx, input)
}

func (n *Node) UseNetworkDriver(ctx context.Context, driver network.Driver) error {
	tracer := tracing.EnterFunc(ctx, driver)
	defer tracer.Finish()
	ctx = tracer.Context()

	// FIXME: use a locking system
	n.networkDriver = driver

	// configure network
	n.networkDriver.OnMessage(n.HandleMessage)

	n.networkDriver.SetLocalContactID(n.UserID())
	_ = n.networkDriver.Join(ctx)

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
