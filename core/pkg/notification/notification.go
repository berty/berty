// Local Notification package

package notification

import (
	"path"
	"runtime"
	"sync"

	"github.com/0xAX/notificator"

	"go.uber.org/zap"
)

type Driver interface {
	DisplayNotification(Payload) error
	ReceiveNotification(string)
	ReceivePushID(pushID string, pushIDType string)
}

type Payload struct {
	Title string `json:"title,omitempty"`
	Body  string `json:"body,omitempty"`
	Icon  string `json:"icon,omitempty"`
	Sound string `json:"sound,omitempty"`
	Badge string `json:"badge,omitempty"`
}

// NoopNotification is a Driver
var _ Driver = (*NoopNotification)(nil)

type NoopNotification struct{}

func NewNoopNotification() Driver {
	return &NoopNotification{}
}

func (n *NoopNotification) DisplayNotification(p Payload) error {
	// for debug puprpose
	logger().Debug("DisplayNotification",
		zap.String("title", p.Title),
		zap.String("body", p.Body),
		zap.String("Icon", p.Icon),
		zap.String("Sound", p.Sound),
		zap.String("Badge", p.Badge),
	)

	return nil
}

func (n *NoopNotification) ReceiveNotification(data string) {
	logger().Debug("ReceiveNotification",
		zap.String("data", data),
	)
}

func (n *NoopNotification) ReceivePushID(pushID, pushIDType string) {
	logger().Debug("ReceivePushID")
}

// NoopNotification is a Driver
var _ Driver = (*DesktopNotification)(nil)
var notify *notificator.Notificator
var once sync.Once

func NewDesktopNotification() Driver {
	return &DesktopNotification{}
}

type DesktopNotification struct{}

func (n *DesktopNotification) DisplayNotification(p Payload) error {
	once.Do(func() {
		_, filename, _, _ := runtime.Caller(0)
		iconPath := path.Dir(filename) + "/../../../client/react-native/common/static/img/logo.png"
		notify = notificator.New(notificator.Options{
			DefaultIcon: iconPath,
			AppName:     "Berty",
		})
	})

	return notify.Push(p.Title, p.Body, p.Icon, notificator.UR_NORMAL)
}

func (n *DesktopNotification) ReceiveNotification(data string) {}

func (n *DesktopNotification) ReceivePushID(pushID, pushIDType string) {}
