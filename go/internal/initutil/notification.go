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

func (m *Manager) SetNotificationManager(manager notification.Manager) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// the following check is here to help developers avoid having
	// strange states by using multiple instances of the notification manager
	if m.Node.Messenger.notificationManager != nil {
		panic("initutil.SetNotificationManager was called but there was already an existing value")
	}

	m.Node.Messenger.notificationManager = manager
}

func (m *Manager) GetNotificationManager() (notification.Manager, error) {
	defer m.prepareForGetter()()

	return m.getNotificationManager()
}

func (m *Manager) getNotificationManager() (notification.Manager, error) {
	m.applyDefaults()

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
