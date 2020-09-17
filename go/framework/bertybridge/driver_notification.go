package bertybridge

import (
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/notification"
)

type LocalNotification struct {
	Title    string
	Body     string
	Interval float64
}

type NotificationDriver interface {
	Post(notif *LocalNotification) error
}

// noopNotificationDriver is NotificationDriver
var _ NotificationDriver = (*noopNotificationDriver)(nil)

type noopNotificationDriver struct{}

func (*noopNotificationDriver) Post(*LocalNotification) error { return nil }

type notificationManagerAdaptater struct {
	logger *zap.Logger
	driver NotificationDriver
}

// notificationManagerAdaptater is a NotificationManager
var _ notification.Manager = (*notificationManagerAdaptater)(nil)

func newNotificationManagerAdaptater(logger *zap.Logger, driver NotificationDriver) notification.Manager {
	return &notificationManagerAdaptater{logger, driver}
}

func (a *notificationManagerAdaptater) Notify(notif *notification.Notification) error {
	a.logger.Debug("notification triggered",
		zap.String("title", notif.Title), zap.String("body", notif.Body))
	return a.driver.Post(&LocalNotification{
		Title:    notif.Title,
		Body:     notif.Body,
		Interval: 0.0,
	})
}

func (a *notificationManagerAdaptater) Schedule(notif *notification.Notification, interval time.Duration) error {
	a.logger.Debug("notification scheduled",
		zap.String("title", notif.Title), zap.String("body", notif.Body))
	return a.driver.Post(&LocalNotification{
		Title:    notif.Title,
		Body:     notif.Body,
		Interval: interval.Seconds(),
	})
}
