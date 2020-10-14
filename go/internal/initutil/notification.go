package initutil

import (
	"flag"

	"github.com/markbates/pkger"

	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (m *Manager) SetupNotificationManagerFlags(fs *flag.FlagSet) {
	fs.BoolVar(&m.Node.Messenger.DisableNotifications, "node.no-notif", false, "disable desktop notifications")
}

func (m *Manager) GetNotificationManager() (notification.Manager, error) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	return m.getNotificationManager()
}

func (m *Manager) getNotificationManager() (notification.Manager, error) {
	if m.Node.Messenger.notificationManager != nil {
		return m.Node.Messenger.notificationManager, nil
	}

	logger, err := m.getLogger()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	notifLogger := logger.Named("notif")
	var notificationManager notification.Manager
	if m.Node.Messenger.DisableNotifications {
		notificationManager = notification.NewLoggerManager(notifLogger)
	} else {
		notificationManager = notification.NewDesktopManager(notifLogger, pkger.Include("/assets/Buck_Berty_Icon_Card.svg"))
	}
	m.Node.Messenger.notificationManager = notificationManager
	return notificationManager, nil
}
