package core

import (
	"fmt"

	"berty.tech/core/pkg/notification"
)

// MobileNotification is a notification.Driver
var _ notification.Driver = (*MobileNotification)(nil)

type MobileNotification struct {
	NativeNotification
}

func (n *MobileNotification) DisplayNotification(p notification.Payload) error {
	return n.NativeNotification.DisplayNotification(p.Title, p.Body, p.Icon, p.Sound)
}

func (n *MobileNotification) ReceiveNotification(data string) {
	logger().Debug(fmt.Sprintf("Receive notification: %+v", data))
}

// TODO: change pushIDType to enum and see if it build well with gomobile
func (n *MobileNotification) ReceivePushID(pushID, pushIDType string) {
	logger().Debug(fmt.Sprintf("Receive push id from %v: %+v", pushIDType, pushID))
}
