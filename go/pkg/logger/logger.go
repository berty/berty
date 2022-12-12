package logger

import (
	"fmt"

	"go.uber.org/zap/zapcore"
)

type Logger struct{}

func logLevelToString(level zapcore.Level) string {
	switch level {
	case zapcore.DebugLevel:
		return "DEBUG"
	case zapcore.InfoLevel:
		return "INFO"
	case zapcore.WarnLevel:
		return "WARN"
	case zapcore.ErrorLevel:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

func (logger *Logger) Log(level zapcore.Level, namespace string, message string) error {
	NativeLog(
		level,
		namespace,
		fmt.Sprintf("[%s] [%s] %s", logLevelToString(level), namespace, message),
	)
	return nil
}

func NewLogger() *Logger {
	return &Logger{}
}

func LevelEnabler(level string) bool {
	return true
}
