package coreinterface

import (
	"berty.tech/client/react-native/gomobile/core"
	"berty.tech/core/pkg/notification"
	astilectron "github.com/asticode/go-astilectron"
	"go.uber.org/zap"
)

var _ notification.Driver = (*ElectronNotification)(nil)

type ElectronNotification struct {
	electron *astilectron.Astilectron
}

func SetNotificationDriver(e *astilectron.Astilectron, _ []*astilectron.Window, _ *astilectron.Menu, _ *astilectron.Tray, _ *astilectron.Menu) error {
	ElectronNotificationDriver := NewElectronNotification(e)
	core.ElectronNotificationDriver = &ElectronNotificationDriver
	return nil
}

func NewElectronNotification(e *astilectron.Astilectron) notification.Driver {
	return &ElectronNotification{
		electron: e,
	}
}

func (e *ElectronNotification) Display(p *notification.Payload) error {
	notif := e.electron.NewNotification(&astilectron.NotificationOptions{
		Body:  p.Body,
		Title: p.Title,
		Icon:  "resources/icon.png",
		// HasReply:         astilectron.PtrBool(true), // Only MacOSX
		// ReplyPlaceholder: "Type a response...", // Only MacOSX
	})

	notif.On(astilectron.EventNameNotificationEventClicked, func(e astilectron.Event) (deleteListener bool) {
		zap.L().Debug("notification clicked")
		// TODO: implement conversation opening
		return true
	})

	// Only for MacOSX
	notif.On(astilectron.EventNameNotificationEventReplied, func(e astilectron.Event) (deleteListener bool) {
		zap.L().Debug("notification replied", zap.String("reply", e.Reply))
		// TODO: implement send reply
		return true
	})

	notif.Create()
	notif.Show()

	return nil
}

func (e *ElectronNotification) Register() error { return nil }

func (e *ElectronNotification) Unregister() error { return nil }

func (e *ElectronNotification) RefreshToken() error { return nil }

func (e *ElectronNotification) Subscribe() chan []byte { return nil }

func (e *ElectronNotification) Unsubscribe(chan []byte) {}

func (e *ElectronNotification) SubscribeToken() chan *notification.Token { return nil }

func (e *ElectronNotification) UnsubscribeToken(chan *notification.Token) {}
