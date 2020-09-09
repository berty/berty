package notification

import "time"

// NoopManager is a Manager
var _ Manager = (*NoopManager)(nil)

type NoopManager struct{}

func NewNoopManager() Manager {
	return &NoopManager{}
}

func (nm *NoopManager) Notify(*Notification) error                  { return nil }
func (nm *NoopManager) Schedule(*Notification, time.Duration) error { return nil }
