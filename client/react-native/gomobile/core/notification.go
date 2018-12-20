package core

import (
	"berty.tech/core/pkg/notification"
)

// nativeNotificationModule is a notification.Driver
var _ notification.Driver = (*nativeNotificationModule)(nil)

type nativeNotificationModule struct {
	NativeNotification
}

func (n nativeNotificationModule) DisplayNotification(p notification.Payload) error {
	return n.NativeNotification.DisplayNativeNotification(p.Title, p.Body, p.Icon, p.Sound)
}
