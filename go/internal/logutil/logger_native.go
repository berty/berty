package logutil

import (
	"fmt"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type nativeCore struct {
	subsystem string
	enc       zapcore.Encoder
}

func NewNativeDriverCore(subsystem string, enc zapcore.Encoder) zapcore.Core {
	return &nativeCore{subsystem: subsystem, enc: enc}
}

func (nc *nativeCore) Enabled(level zapcore.Level) bool {
	return true
}

func (nc *nativeCore) With(fields []zapcore.Field) zapcore.Core {
	return &nativeCore{enc: nc.enc}
}

func (nc *nativeCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	return checked.AddCore(entry, nc)
}

func (nc *nativeCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := nc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	NativeLog(
		entry.Level,
		fmt.Sprintf("%s.%s", nc.subsystem, entry.LoggerName),
		buff.String(),
	)
	return nil
}

func (nc *nativeCore) Sync() error {
	return nil
}

func NewNativeLogger(subsystem string) *zap.Logger {
	// native logger
	nativeEncoderConfig := zap.NewDevelopmentEncoderConfig()
	nativeEncoderConfig.LevelKey = ""
	nativeEncoderConfig.TimeKey = ""
	nativeEncoderConfig.NameKey = ""
	nativeEncoderConfig.CallerKey = ""

	nativeEncoder := zapcore.NewConsoleEncoder(nativeEncoderConfig)

	core := NewNativeDriverCore(subsystem, nativeEncoder)

	// create logger
	logger := zap.New(core)

	return logger
}
