package core

import (
	"encoding/hex"
	"fmt"

	"berty.tech/core/pkg/notification"
	"go.uber.org/zap"
)

var _ notification.Driver = (*MobileNotification)(nil)

type NativeNotificationDriver interface {
	Display(title, body, icon, sound, badge string) error
	Register() error
	Unregister() error
	RefreshToken() error
}

type MobileNotification struct {
	Native NativeNotificationDriver
}

func (n *MobileNotification) Receive(data string) {
	logger().Debug(fmt.Sprintf("receive notification: %+v", data))
}

// TODO: change tokenType to enum and see if it build well with gomobile
func (n *MobileNotification) ReceiveToken(token []byte, tokenType string) {
	logger().Debug("receive token",
		zap.String("type", tokenType),
		zap.String("token", hex.EncodeToString(token)),
	)
}

//
// Native
//
func (n *MobileNotification) Display(p *notification.Payload) error {
	return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.Badge)
}

func (n *MobileNotification) Register() error {
	return n.Native.Register()
}

func (n *MobileNotification) Unregister() error {
	return n.Native.Unregister()
}

func (n *MobileNotification) RefreshToken() error {
	return n.Native.RefreshToken()
}
