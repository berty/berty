// Local Notification package

package notification

import (
	"github.com/gen2brain/beeep"
	"go.uber.org/zap"
)

type Driver interface {
	DisplayNotification(Payload) error
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
	logger().Debug("NoopNotification",
		zap.String("title", p.Title),
		zap.String("body", p.Body),
		zap.String("Icon", p.Icon),
		zap.String("Sound", p.Sound),
		zap.String("Badge", p.Badge),
	)

	return nil
}

// NoopNotification is a Driver
var _ Driver = (*DesktopNotification)(nil)

func NewDesktopNotification() Driver {
	return &DesktopNotification{}
}

type DesktopNotification struct{}

func (n *DesktopNotification) DisplayNotification(p Payload) error {
	return beeep.Notify(p.Title, p.Body, p.Icon)
}
