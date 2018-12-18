package core

import (
	"berty.tech/core/pkg/notification"
	"go.uber.org/zap"
)

// nativeNotificationModule is a notification.Driver
var _ notification.Driver = (*nativeNotificationModule)(nil)

type nativeNotificationModule struct {
	NativeNotification
}

func (n nativeNotificationModule) DisplayNotification(p notification.Payload) error {
	logger().Debug("NODE Notification",
		zap.String("title", p.Title),
		zap.String("body", p.Body),
		zap.String("Icon", p.Icon),
		zap.String("Sound", p.Sound),
		zap.String("Badge", p.Badge),
	)

	return n.NativeNotification.DisplayNativeNotification(p.Title, p.Body, p.Icon, p.Sound)
}
