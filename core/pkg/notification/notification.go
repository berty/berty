// Local Notification package

package notification

import (
	"encoding/hex"
	"path"
	"runtime"
	"sync"

	"berty.tech/core/push"
	"github.com/0xAX/notificator"
	"go.uber.org/zap"
)

type Driver interface {
	Display(*Payload) error
	Register() error
	Unregister() error
	Subscribe() chan []byte
	Unsubscribe(chan []byte)
	SubscribeToken() chan *Token
	UnsubscribeToken(chan *Token)
	RefreshToken() error
}

type Token struct {
	Value []byte
	Type  push.DevicePushType
}

func (t *Token) Hash() string {
	switch t.Type {
	default:
		return ""
	case push.DevicePushType_FCM:
		return string(t.Value)
	case push.DevicePushType_APNS:
		return hex.EncodeToString(t.Value)
	}
}

type Payload struct {
	Title    string `json:"title,omitempty"`
	Body     string `json:"body,omitempty"`
	Icon     string `json:"icon,omitempty"`
	Sound    string `json:"sound,omitempty"`
	Badge    string `json:"badge,omitempty"`
	DeepLink string `json:"deep-link,omitempty"`
}

// NoopNotification is a Driver
var _ Driver = (*NoopNotification)(nil)

type NoopNotification struct{}

func NewNoopNotification() Driver {
	return &NoopNotification{}
}

func (n *NoopNotification) Display(p *Payload) error {
	// for debug puprpose
	logger().Debug("Display",
		zap.String("title", p.Title),
		zap.String("body", p.Body),
		zap.String("Icon", p.Icon),
		zap.String("Sound", p.Sound),
		zap.String("Badge", p.Badge),
	)

	return nil
}

func (n *NoopNotification) Register() error {
	logger().Debug("registered")
	return nil
}

func (n *NoopNotification) Unregister() error {
	logger().Debug("unregister")
	return nil
}

func (n *NoopNotification) RefreshToken() error {
	logger().Debug("RefreshToken")
	return nil
}

func (n *NoopNotification) Subscribe() chan []byte {
	logger().Debug("noop notification handler not implemented")
	return nil
}

func (n *NoopNotification) Unsubscribe(chan []byte) {

}

func (n *NoopNotification) SubscribeToken() chan *Token {
	logger().Debug("noop notification token handler not implemented")
	return nil
}

func (n *NoopNotification) UnsubscribeToken(chan *Token) {

}

// NoopNotification is a Driver
var _ Driver = (*DesktopNotification)(nil)
var notify *notificator.Notificator
var once sync.Once

func NewDesktopNotification() Driver {
	return &DesktopNotification{}
}

type DesktopNotification struct{}

func (n *DesktopNotification) Display(p *Payload) error {
	once.Do(func() {
		_, filename, _, _ := runtime.Caller(0)
		iconPath := path.Dir(filename) + "/../../../client/react-native/common/static/img/logo.png"
		notify = notificator.New(notificator.Options{
			DefaultIcon: iconPath,
			AppName:     "Berty",
		})
	})

	logger().Debug("notify push")
	return notify.Push(p.Title, p.Body, p.Icon, notificator.UR_NORMAL)
}

func (n *DesktopNotification) Register() error {
	return nil
}

func (n *DesktopNotification) Unregister() error {
	return nil
}

func (n *DesktopNotification) RefreshToken() error {
	logger().Debug("RefreshToken")
	return nil
}

func (n *DesktopNotification) Subscribe() chan []byte {
	logger().Debug("noop notification handler not implemented")
	return nil
}

func (n *DesktopNotification) Unsubscribe(chan []byte) {

}

func (n *DesktopNotification) SubscribeToken() chan *Token {
	logger().Debug("noop notification token handler not implemented")
	return nil
}

func (n *DesktopNotification) UnsubscribeToken(chan *Token) {

}
