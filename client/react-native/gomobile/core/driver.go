package core

type NativeLogger interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}
