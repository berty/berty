package initutil

func (m *Manager) SetDevicePushKeyPath(keyPath string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	// the following check is here to help developers avoid having
	// strange states by using multiple instances of the notification manager
	if m.Node.Protocol.DevicePushKeyPath != "" {
		panic("initutil.SetDevicePushKeyPath was called but there was already an existing value")
	}

	m.Node.Protocol.DevicePushKeyPath = keyPath
}
