package core

type NativeLogger interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}

type NativeNotification interface {
	DisplayNotification(title, body, icon, sound string) error
}
