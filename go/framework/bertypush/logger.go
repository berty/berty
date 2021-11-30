package bertypush

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type LoggerDriver interface {
	Print(string)
}

type nativeCore struct {
	zapcore.Core
	enc    zapcore.Encoder
	logger LoggerDriver
}

func NewNativeDriverCore(core zapcore.Core, enc zapcore.Encoder, nlogger LoggerDriver) zapcore.Core {
	return &nativeCore{
		Core:   core,
		enc:    enc,
		logger: nlogger,
	}
}

func (n *nativeCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	return checked.AddCore(entry, n)
}

func (n *nativeCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := n.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	n.logger.Print(buff.String())
	return nil
}

func (n *nativeCore) With(fields []zapcore.Field) zapcore.Core {
	return &nativeCore{
		Core:   n.Core.With(fields),
		enc:    n.enc,
		logger: n.logger,
	}
}

func newLogger(p LoggerDriver) *zap.Logger {
	if p == nil {
		return zap.NewNop()
	}

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
	ncore := NewNativeDriverCore(core, nativeEncoder, p)

	// create logger
	logger := zap.New(ncore)

	return logger
}
