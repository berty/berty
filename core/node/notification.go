package node

import (
	"context"

	"berty.tech/core/pkg/notification"
	"go.uber.org/zap"
)

// WithNotification registers a notification driver
func WithNotificationDriver(driver notification.Driver) NewNodeOption {
	return func(n *Node) {
		n.notificationDriver = driver
	}
}

func (n *Node) DisplayNotification(payload *notification.Payload) {
	if err := n.notificationDriver.Display(payload); err != nil {
		logger().Error("Notification", zap.Error(err))
	}
}

func (n *Node) UseNotificationDriver(ctx context.Context) {
	n.UsePushTokenSubscriber(ctx)
	n.UsePushNotificationSubscriber(ctx)
}
