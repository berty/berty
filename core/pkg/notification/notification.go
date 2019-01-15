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
	Display(*Payload) error
	Register() error
	Unregister() error
	Receive(string)
	ReceiveToken(token []byte, tokenType string)
	RefreshToken() error
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

func (n *NoopNotification) Receive(data string) {
	logger().Debug("Receive",
		zap.String("data", data),
	)
}

func (n *NoopNotification) ReceiveToken(token []byte, tokenType string) {
	logger().Debug("ReceiveToken")
}

func (n *NoopNotification) RefreshToken() error {
	logger().Debug("RefreshToken")
	return nil
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

	return notify.Push(p.Title, p.Body, p.Icon, notificator.UR_NORMAL)
}

func (n *DesktopNotification) Register() error {
	return nil
}

func (n *DesktopNotification) Unregister() error {
	return nil
}

func (n *DesktopNotification) Receive(data string) {}

func (n *DesktopNotification) ReceiveToken(token []byte, tokenType string) {}

func (n *DesktopNotification) RefreshToken() error {
	logger().Debug("RefreshToken")
	return nil
}
