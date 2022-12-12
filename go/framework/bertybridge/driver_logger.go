package bertybridge

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"berty.tech/berty/v2/go/pkg/logger"
)

type nativeCore struct {
	zapcore.Core
	enc    zapcore.Encoder
	logger *logger.Logger
}

func NewNativeDriverCore(core zapcore.Core, enc zapcore.Encoder, logger *logger.Logger) zapcore.Core {
	return &nativeCore{
		Core:   core,
		enc:    enc,
		logger: logger,
	}
}

func (nc *nativeCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if logger.LevelEnabler(entry.Level.CapitalString()) {
		return checked.AddCore(entry, nc)
	}

	return checked
}

func (nc *nativeCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := nc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	return nc.logger.Log(entry.Level, entry.LoggerName, buff.String())
}

func (nc *nativeCore) With(fields []zapcore.Field) zapcore.Core {
	return &nativeCore{
		Core:   nc.Core.With(fields),
		enc:    nc.enc,
		logger: nc.logger,
	}
}

func newLogger() *zap.Logger {
	// native logger
	nativeEncoderConfig := zap.NewDevelopmentEncoderConfig()
	nativeEncoderConfig.LevelKey = ""
	nativeEncoderConfig.TimeKey = ""
	nativeEncoderConfig.NameKey = ""
	nativeEncoderConfig.CallerKey = ""

	nativeEncoder := zapcore.NewConsoleEncoder(nativeEncoderConfig)
	nativeOutput := zapcore.AddSync(os.Stdout)

	nativeLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool { return lvl >= zapcore.DebugLevel })
	core := zapcore.NewCore(nativeEncoder, nativeOutput, nativeLevel)
	ncore := NewNativeDriverCore(core, nativeEncoder, logger.NewLogger())

	// create logger
	logger := zap.New(ncore)

	return logger
}
