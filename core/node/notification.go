package node

import (
	"fmt"

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
	if err := n.notificationDriver.DisplayNotification(payload); err != nil {
		logger().Error("Notification", zap.Error(err))
	}
}

func (n *Node) UseNotificationDriver() {
	go func() {
		// TODO: remove next line
		n.notificationDriver.Register()
		payloadChan := n.notificationDriver.Subscribe()
		tokenChan := n.notificationDriver.SubscribeToken()
		for {
			select {
			case payload := <-payloadChan:
				logger().Debug("node receive notification",
					zap.String("payload", fmt.Sprintf("%+v", payload)),
				)
			case token := <-tokenChan:
				logger().Debug("node receive notification token",
					zap.String("token", fmt.Sprintf("%+v", token.String())),
				)
			case <-n.shutdown:
				logger().Debug("node notification driver shutdown")
				n.notificationDriver.Unsubscribe(payloadChan)
				n.notificationDriver.UnsubscribeToken(tokenChan)
				return
			}
		}
	}()
}
