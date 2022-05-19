package logging

import (
	"fmt"
	"os"
	"time"

	mlogger "github.com/gruntwork-io/terratest/modules/logger"
	"github.com/gruntwork-io/terratest/modules/testing"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	callDepth = 3
)

var logpath string

func init() {
	dirname, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	_, err = os.Stat(fmt.Sprintf("%s/logs/berty", dirname))
	if os.IsNotExist(err) {
		err = os.MkdirAll(fmt.Sprintf("%s/logs/berty", dirname), 0755)
		if err != nil {
			panic(err)
		}
	}

	logpath = fmt.Sprintf("%s/logs/berty/berty-infra-server.log", dirname)
}

type zapTestLogger struct {
	l *zap.Logger
}

func (z *zapTestLogger) Logf(t testing.TestingT, format string, args ...interface{}) {
	if format != "" {
		msg := fmt.Sprintf(format, args...)
		z.l.Sugar().Info(msg)
	}
}

func TerraformLogger(logger *zap.Logger) *mlogger.Logger {
	return mlogger.New(&zapTestLogger{logger})
}

func NewFileLogger(level zapcore.Level) (*zap.Logger, error) {
	logFile, err := os.OpenFile(logpath, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0755)
	if err != nil {
		return nil, fmt.Errorf("unable to open file(%s): %w", logpath, err)
	}
	encoder := newFileEncoder()
	fileSync := zapcore.AddSync(logFile)
	core := zapcore.NewCore(encoder, fileSync, zapcore.DebugLevel)
	return zap.New(core), nil
}

func NewConsoleLogger(level zapcore.Level) (*zap.Logger, error) {
	encoder := newConsoleEncoder()
	stdoutLock := zapcore.Lock(os.Stdout)
	core := zapcore.NewCore(encoder, stdoutLock, level)
	return zap.New(core), nil
}

func NewTeeLogger(level zapcore.Level) (*zap.Logger, error) {
	// file log
	logFile, err := os.OpenFile(logpath, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0755)
	if err != nil {
		return nil, fmt.Errorf("unable to open file(%s): %w", logpath, err)
	}
	fileEncoder := newFileEncoder()
	fileSync := zapcore.AddSync(logFile)

	// console
	consoleEncoder := newConsoleEncoder()
	stdoutLock := zapcore.Lock(os.Stdout)

	// tee log
	core := zapcore.NewTee(
		zapcore.NewCore(fileEncoder, fileSync, zapcore.DebugLevel),
		zapcore.NewCore(consoleEncoder, stdoutLock, level),
	)

	return zap.New(core), nil
}

func newFileEncoder() zapcore.Encoder {
	fileConfig := zap.NewProductionEncoderConfig()
	fileConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	return zapcore.NewJSONEncoder(fileConfig)
}

func newConsoleEncoder() zapcore.Encoder {
	// console log
	consoleConfig := zap.NewDevelopmentEncoderConfig()
	consoleConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleConfig.EncodeTime = zapcore.TimeEncoderOfLayout(time.Stamp)
	return zapcore.NewConsoleEncoder(consoleConfig)
}
