package node

import (
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/core/api/node"
)

func (n *Node) EnqueueNodeEvent(kind node.Kind, attributes proto.Message) {
	event, err := node.NewEvent(kind, attributes)
	if err != nil {
		logger().Error("failed to create node.NodeStarted event")
	} else {
		n.clientEvents <- event
	}
}

func (n *Node) LogBackgroundError(err error) {
	logger().Error("background error", zap.Error(err))
	n.EnqueueNodeEvent(node.Kind_BackgroundError, &node.BackgroundErrorAttrs{
		ErrMsg: err.Error(),
	})
}

func (n *Node) LogBackgroundWarn(err error) {
	logger().Warn("background warn", zap.Error(err))
	n.EnqueueNodeEvent(node.Kind_BackgroundWarn, &node.BackgroundWarnAttrs{
		ErrMsg: err.Error(),
	})
}

func (n *Node) LogBackgroundDebug(msg string) {
	logger().Debug("background debug", zap.String("msg", msg))
	n.EnqueueNodeEvent(node.Kind_Debug, &node.DebugAttrs{
		Msg: msg,
	})
}
