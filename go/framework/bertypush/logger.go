package bertypush

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type LoggerDriver interface {
	Print(string)
}

type nativeLogger struct {
	zapcore.Core
	enc zapcore.Encoder
	p   LoggerDriver
}

func (mc *nativeLogger) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	return checked.AddCore(entry, mc)
}

func (mc *nativeLogger) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := mc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	mc.p.Print(buff.String())
	return nil
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
	nativeOutput := zapcore.Lock(os.Stderr)

	nativeLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool { return lvl >= zapcore.DebugLevel })
	nativeCore := &nativeLogger{
		Core: zapcore.NewCore(nativeEncoder, nativeOutput, nativeLevel),
		enc:  nativeEncoder,
		p:    p,
	}

	// create logger
	logger := zap.New(nativeCore)
	return logger
}
