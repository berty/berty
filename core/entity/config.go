package entity

func (c *Config) Filtered() *Config {
	return &Config{
		ID:                         c.ID,
		PushRelayPubkeyAPNS:        c.PushRelayPubkeyAPNS,
		PushRelayPubkeyFCM:         c.PushRelayPubkeyFCM,
		UpdatedAt:                  c.UpdatedAt,
		CreatedAt:                  c.CreatedAt,
		DebugNotificationVerbosity: c.DebugNotificationVerbosity,
		NotificationsEnabled:       c.NotificationsEnabled,
		NotificationsPreviews:      c.NotificationsPreviews,
	}
}

func (c *Config) IsDebugNotificationAllowed(verbosity DebugVerbosity) bool {
	return c.NotificationsEnabled == true && verbosity <= c.DebugNotificationVerbosity
}
