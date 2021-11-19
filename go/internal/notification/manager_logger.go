package notification

import (
	"time"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

// LoggerManager is a Manager
var _ Manager = (*LoggerManager)(nil)

type LoggerManager struct {
	logger *zap.Logger
}

func NewLoggerManager(logger *zap.Logger) Manager {
	return &LoggerManager{logger}
}

func (m *LoggerManager) Notify(notif *Notification) error {
	m.logger.Info("notification triggered",
		logutil.PrivateString("title", notif.Title),
		logutil.PrivateString("body", notif.Body))
	return nil
}

func (m *LoggerManager) Schedule(notif *Notification, interval time.Duration) error {
	m.logger.Info("scheduling notification", zap.Duration("interval", interval))
	time.AfterFunc(interval, func() { _ = m.Notify(notif) })
	return nil
}
