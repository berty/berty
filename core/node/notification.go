package node

import (
	"berty.tech/core/pkg/notification"
	"go.uber.org/zap"
)

// WithNotification registers a notification driver
func WithNotificationDriver(driver notification.Driver) NewNodeOption {
	return func(n *Node) {
		n.notificationDriver = driver
	}
}

func (n *Node) DisplayNotification(payload notification.Payload) {
	if err := n.notificationDriver.DisplayNotification(payload); err != nil {
		logger().Error("Notification", zap.Error(err))
	}
}
