package bertybridge

import (
	"os"

	"berty.tech/berty/v2/go/internal/logutil"
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

func newLogger(filters string, mlogger NativeLoggerDriver) (*zap.Logger, func(), error) {
	if filters == "" {
		return zap.NewNop(), func() {}, nil
	}

	if mlogger == nil {
		return logutil.NewLogger(filters, "console", "stderr")
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

	// bind ipfs logger with zap
	// @FIXME(gfanton): find a way to bind libp2p logger
	// if err := ipfsutil.ConfigureLogger("*", logger, loglevel); err != nil {
	// 	return nil, err
	// }

	logger.Info("logger initialized", zap.String("filters", filters))
	return logutil.DecorateLogger(logger, filters)
}
