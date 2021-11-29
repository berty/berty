package notification

import (
	"time"

	"github.com/gen2brain/beeep"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	pack "berty.tech/berty/v2/go/internal/packingutil"
)

// DesktopManager is a Manager
var _ Manager = (*DesktopManager)(nil)

type DesktopManager struct {
	logger  *zap.Logger
	appicon string
}

func NewDesktopManager(logger *zap.Logger, appicon string) Manager {
	return &DesktopManager{logger, appicon}
}

func (m *DesktopManager) Notify(notif *Notification) error {
	m.logger.Debug("notification", logutil.PrivateString("title", notif.Title), logutil.PrivateString("body", notif.Body))
	fpack, err := pack.EmbedToSHM(m.appicon)
	if err != nil {
		return err
	}
	defer fpack.Close()
	return beeep.Alert(notif.Title, notif.Body, fpack.Name())
}

func (m *DesktopManager) Schedule(notif *Notification, interval time.Duration) error {
	m.logger.Debug("scheduling notification", logutil.PrivateString("title", notif.Title))
	time.AfterFunc(interval, func() {
		if err := m.Notify(notif); err != nil {
			m.logger.Error("unable to trigger scheduled notification", zap.Error(err))
		}
	})
	return nil
}
