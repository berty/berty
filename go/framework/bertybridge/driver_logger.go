package bertybridge

import (
	"fmt"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type NativeLoggerDriver interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}

// type noopNativeLoggerDriver struct{}

// func (n *noopNativeLoggerDriver) Log(level, namespace, message string) error { return nil }
// func (n *noopNativeLoggerDriver) LevelEnabler(level string) bool             { return false }

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

func newLogger(loglevel string) (logger *zap.Logger, err error) {
	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder

	switch loglevel {
	case "", "warn":
		config.Level.SetLevel(zap.WarnLevel)
	case "info":
		config.Level.SetLevel(zap.InfoLevel)
	case "debug":
		config.Level.SetLevel(zap.DebugLevel)
	default:
		err = fmt.Errorf("unsupported log level: %q", loglevel)
		return
	}

	logger, err = config.Build()
	return
}

func newNativeLogger(loglevel string, mlogger NativeLoggerDriver) (*zap.Logger, error) {
	// native logger
	nativeEncoderConfig := zap.NewDevelopmentEncoderConfig()
	nativeEncoderConfig.LevelKey = ""
	nativeEncoderConfig.TimeKey = ""
	nativeEncoderConfig.NameKey = ""
	nativeEncoderConfig.CallerKey = ""

	nativeEncoder := zapcore.NewConsoleEncoder(nativeEncoderConfig)
	nativeOutput := zapcore.Lock(os.Stderr)

	var zapLogLevel zapcore.Level
	switch loglevel {
	case "", "warn":
		zapLogLevel = zap.WarnLevel
	case "info":
		zapLogLevel = zap.InfoLevel
	case "debug":
		zapLogLevel = zap.DebugLevel
	default:
		return nil, fmt.Errorf("unsupported log level: %q", loglevel)
	}

	nativeLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool { return lvl >= zapLogLevel })
	nativeCore := &nativeLogger{
		Core: zapcore.NewCore(nativeEncoder, nativeOutput, nativeLevel),
		enc:  nativeEncoder,
		l:    mlogger,
	}

	// create logger
	logger := zap.New(nativeCore)

	// bind ipfs logger with zap
	// @FIXME(gfanton): find a way to bind libp2p logger
	// if err := ipfsutil.ConfigureLogger("*", logger, loglevel); err != nil {
	// 	return nil, err
	// }

	logger.Info("logger initialized", zap.String("level", loglevel))
	return logger, nil
}
