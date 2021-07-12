package bertybridge

import (
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/notification"
)

type NotificationDriver interface {
	Post(notif *LocalNotification) error
}

// noopNotificationDriver is NotificationDriver
var _ NotificationDriver = (*noopNotificationDriver)(nil)

type noopNotificationDriver struct{}

func (*noopNotificationDriver) Post(*LocalNotification) error { return nil }

type notificationManagerAdapter struct {
	logger *zap.Logger
	driver NotificationDriver
}

// notificationManagerAdapter is a NotificationManager
var _ notification.Manager = (*notificationManagerAdapter)(nil)

func newNotificationManagerAdapter(logger *zap.Logger, driver NotificationDriver) notification.Manager {
	return &notificationManagerAdapter{logger, driver}
}

func (a *notificationManagerAdapter) Notify(notif *notification.Notification) error {
	a.logger.Debug("notification triggered",
		zap.String("title", notif.Title), zap.String("body", notif.Body))
	return a.driver.Post(&LocalNotification{
		Title:    notif.Title,
		Body:     notif.Body,
		Interval: 0.0,
	})
}

func (a *notificationManagerAdapter) Schedule(notif *notification.Notification, interval time.Duration) error {
	a.logger.Debug("notification scheduled",
		zap.String("title", notif.Title), zap.String("body", notif.Body))
	return a.driver.Post(&LocalNotification{
		Title:    notif.Title,
		Body:     notif.Body,
		Interval: interval.Seconds(),
	})
}

type LocalNotification struct {
	Title    string
	Body     string
	Interval float64
}
