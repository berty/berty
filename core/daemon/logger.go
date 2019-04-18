package daemon

type NativeLogger interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}

type NoopLogger struct{}

func (nl *NoopLogger) Log(_, _, _ string) error       { return nil }
func (nl *NoopLogger) LevelEnabler(level string) bool { return true }
