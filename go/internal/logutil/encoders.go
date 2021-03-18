package logutil

import (
	"fmt"

	"go.uber.org/zap/zapcore"
)

const (
	Black uint8 = iota + 30
	Red
	Green
	Yellow
	Blue
	Magenta
	Cyan
	White
)

func stableWidthNameEncoder(loggerName string, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(fmt.Sprintf("%-18s", loggerName))
}

func stableWidthCapitalLevelEncoder(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(fmt.Sprintf("%-5s", l.CapitalString()))
}

func stableWidthCapitalColorLevelEncoder(l zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	switch l {
	case zapcore.DebugLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Magenta, "DEBUG"))
	case zapcore.InfoLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Blue, "INFO "))
	case zapcore.WarnLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Yellow, "WARN "))
	case zapcore.ErrorLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "ERROR"))
	case zapcore.DPanicLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "DPANIC"))
	case zapcore.PanicLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "PANIC"))
	case zapcore.FatalLevel:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, "FATAL"))
	default:
		enc.AppendString(fmt.Sprintf("\x1b[%dm%s\x1b[0m", Red, l.CapitalString()))
	}
}
