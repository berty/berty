package core

import (
	"os"
	"path"

	"berty.tech/core/pkg/logmanager"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func logger() *zap.Logger {
	return zap.L().Named(defaultLoggerName)
}

type mobileCore struct {
	zapcore.Core
	enc zapcore.Encoder
	l   NativeLogger
}

func newMobileCore(next zapcore.Core, encoder zapcore.Encoder, l NativeLogger) zapcore.Core {
	return &mobileCore{next, encoder, l}
}

func (mc *mobileCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if mc.l.LevelEnabler(entry.Level.CapitalString()) {
		return checked.AddCore(entry, mc)
	}

	return checked
}

func (mc *mobileCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := mc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	return mc.l.Log(entry.Level.CapitalString(), entry.LoggerName, buff.String())
}

func SetupLogger(logLevel, logPath string, mlogger NativeLogger) error {
	// native logger
	nativeEncoderConfig := zap.NewDevelopmentEncoderConfig()
	nativeEncoderConfig.LevelKey = ""
	nativeEncoderConfig.TimeKey = ""
	nativeEncoderConfig.NameKey = ""
	nativeEncoderConfig.CallerKey = ""
	nativeEncoder := zapcore.NewConsoleEncoder(nativeEncoderConfig)
	nativeOutput := zapcore.Lock(os.Stderr)
	zapLogLevel, err := logmanager.ZapLogLevel(logLevel)
	if err != nil {
		return err
	}
	nativeLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= zapLogLevel
	})
	nativeCore := newMobileCore(
		zapcore.NewCore(nativeEncoder, nativeOutput, nativeLevel),
		nativeEncoder,
		mlogger,
	)

	// start logmanager
	logman, err := logmanager.New(logmanager.Opts{
		RingSize:        10 * 1024 * 1024,
		LogLevel:        logLevel,
		LogNamespaces:   "*",
		LogDirectory:    path.Join(logPath, "logs"),
		AdditionalCores: []zapcore.Core{nativeCore},
	})
	if err != nil {
		return err
	}
	logman.SetGlobal()

	logger().Debug("logger initialized")
	return nil
}
