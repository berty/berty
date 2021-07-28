package bertybridge

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Printer interface {
	Print(string)
}

type printerLogger struct {
	zapcore.Core
	enc zapcore.Encoder
	p   Printer
}

func (mc *printerLogger) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	return checked.AddCore(entry, mc)
}

func (mc *printerLogger) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	buff, err := mc.enc.EncodeEntry(entry, fields)
	if err != nil {
		return err
	}

	mc.p.Print(buff.String())
	return nil
}

func newPrinterLogger(p Printer) *zap.Logger {
	if p == nil {
		return zap.NewNop()
	}

	// printer logger
	printerEncoderConfig := zap.NewDevelopmentEncoderConfig()
	printerEncoderConfig.LevelKey = ""
	printerEncoderConfig.TimeKey = ""
	printerEncoderConfig.NameKey = ""
	printerEncoderConfig.CallerKey = ""

	printerEncoder := zapcore.NewConsoleEncoder(printerEncoderConfig)
	printerOutput := zapcore.Lock(os.Stderr)

	printerLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool { return lvl >= zapcore.DebugLevel })
	printerCore := &printerLogger{
		Core: zapcore.NewCore(printerEncoder, printerOutput, printerLevel),
		enc:  printerEncoder,
		p:    p,
	}

	// create logger
	logger := zap.New(printerCore)
	return logger
}
