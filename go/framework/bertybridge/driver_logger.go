package bertybridge

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type NativeLoggerDriver interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}

type nativeLogger struct {
	zapcore.Core
	enc zapcore.Encoder
	l   NativeLoggerDriver
}

func (mc *nativeLogger) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if mc.l.LevelEnabler(entry.Level.CapitalString()) {
		return checked.AddCore(entry, mc)
	}

	return checked
}

func (mc *nativeLogger) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := mc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	return mc.l.Log(entry.Level.CapitalString(), entry.LoggerName, buff.String())
}

func newLogger(mlogger NativeLoggerDriver) *zap.Logger {
	if mlogger == nil {
		return zap.NewNop()
	}

	// native logger
	nativeEncoderConfig := zap.NewDevelopmentEncoderConfig()
	nativeEncoderConfig.LevelKey = ""
	nativeEncoderConfig.TimeKey = ""
	nativeEncoderConfig.NameKey = ""
	nativeEncoderConfig.CallerKey = ""

	nativeEncoder := zapcore.NewConsoleEncoder(nativeEncoderConfig)
	nativeOutput := zapcore.Lock(os.Stderr)

	nativeLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool { return lvl >= zapcore.DebugLevel })
	nativeCore := &nativeLogger{
		Core: zapcore.NewCore(nativeEncoder, nativeOutput, nativeLevel),
		enc:  nativeEncoder,
		l:    mlogger,
	}

	// create logger
	logger := zap.New(nativeCore)

	return logger
}
