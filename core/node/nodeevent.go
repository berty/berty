package node

import (
	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/i18n"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/pkg/tracing"
	"context"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"
)

func (n *Node) EnqueueNodeEvent(ctx context.Context, kind node.Kind, attributes proto.Message) {
	tracer := tracing.EnterFunc(ctx, kind, attributes)
	defer tracer.Finish()
	// ctx = tracer.Context()

	event, err := node.NewEvent(kind, attributes)
	if err != nil {
		logger().Error("failed to create node.NodeStarted event")
	} else {
		n.clientEvents <- event
	}
}

func (n *Node) LogBackgroundCritical(ctx context.Context, err error) {
	logger().Error("background error", zap.Error(err))
	n.EnqueueNodeEvent(ctx, node.Kind_BackgroundCritical, &node.BackgroundCriticalAttrs{
		ErrMsg: err.Error(),
	})

	if n.config.IsDebugNotificationAllowed(entity.DebugVerbosity_VERBOSITY_LEVEL_CRITICAL) {
		n.DisplayNotification(&notification.Payload{
			Title: i18n.T("LogBackgroundCritical", nil),
			Body:  err.Error(),
			// Icon
			// Sound
			// Badge
		})
	}
}

func (n *Node) LogBackgroundError(ctx context.Context, err error) {
	logger().Error("background error", zap.Error(err))
	n.EnqueueNodeEvent(ctx, node.Kind_BackgroundError, &node.BackgroundErrorAttrs{
		ErrMsg: err.Error(),
	})

	if n.config.IsDebugNotificationAllowed(entity.DebugVerbosity_VERBOSITY_LEVEL_ERROR) {
		n.DisplayNotification(&notification.Payload{
			Title: i18n.T("LogBackgroundError", nil),
			Body:  err.Error(),
			// Icon
			// Sound
			// Badge
		})
	}
}

func (n *Node) LogBackgroundWarn(ctx context.Context, err error) {
	logger().Warn("background warn", zap.Error(err))
	n.EnqueueNodeEvent(ctx, node.Kind_BackgroundWarn, &node.BackgroundWarnAttrs{
		ErrMsg: err.Error(),
	})

	if n.config.IsDebugNotificationAllowed(entity.DebugVerbosity_VERBOSITY_LEVEL_WARN) {
		n.DisplayNotification(&notification.Payload{
			Title: i18n.T("LogBackgroundWarn", nil),
			Body:  err.Error(),
			// Icon
			// Sound
			// Badge
		})
	}
}

func (n *Node) LogBackgroundInfo(ctx context.Context, msg string) {
	logger().Debug("background info", zap.String("msg", msg))
	n.EnqueueNodeEvent(ctx, node.Kind_BackgroundInfo, &node.DebugAttrs{
		Msg: msg,
	})

	if n.config.IsDebugNotificationAllowed(entity.DebugVerbosity_VERBOSITY_LEVEL_INFO) {
		n.DisplayNotification(&notification.Payload{
			Title: i18n.T("LogBackgroundInfo", nil),
			Body:  msg,
			// Icon
			// Sound
			// Badge
		})
	}
}
