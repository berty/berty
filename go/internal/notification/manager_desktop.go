package notification

import (
	"time"

	"github.com/gen2brain/beeep"
	"go.uber.org/zap"
)

// DesktopManager is a Manager
var _ Manager = (*DesktopManager)(nil)

type DesktopManager struct {
	logger  *zap.Logger
	appicon string
}

func NewDesktopManger(logger *zap.Logger, appicon string) Manager {
	return &DesktopManager{logger, appicon}
}

func (m *DesktopManager) Notify(notif *Notification) error {
	m.logger.Debug("notification", zap.String("title", notif.Title), zap.String("body", notif.Body))
	return beeep.Alert(notif.Title, notif.Body, m.appicon)
}

func (m *DesktopManager) Schedule(notif *Notification, interval time.Duration) error {
	m.logger.Debug("scheduling notification", zap.String("title", notif.Title))
	time.AfterFunc(interval, func() {
		if err := m.Notify(notif); err != nil {
			m.logger.Error("unable to trigger scheduled notification", zap.Error(err))
		}
	})
	return nil
}
