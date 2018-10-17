package core

import (
	"fmt"

	p2plog "github.com/ipfs/go-log"
	"github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger interface {
	Log(level, namespace, message string) error
	LevelEnabler(level string) bool
}

type mobileCore struct {
	zapcore.Core
	enc zapcore.Encoder
	l   Logger
}

func newMobileCore(next zapcore.Core, encoder zapcore.Encoder, l Logger) zapcore.Core {
	return &mobileCore{next, encoder, l}
}

func (mc *mobileCore) Check(entry zapcore.Entry, checked *zapcore.CheckedEntry) *zapcore.CheckedEntry {
	if mc.l.LevelEnabler(entry.Level.CapitalString()) {
		return checked.AddCore(entry, mc)
	}

	return checked
}

func (mc *mobileCore) Write(entry zapcore.Entry, fields []zapcore.Field) error {
	var out string

	out = entry.Message
	if len(fields) > 0 {
		out += ": { "
		for i, f := range fields {
			out += f.Key + ": " + f.String
			if i < len(fields)-1 {
				out += ", "
			}
		}
		out += " }"
	}

	return mc.l.Log(entry.Level.CapitalString(), entry.LoggerName, out)
}

type p2pLogBackendWrapper struct {
	logger *zap.Logger
}

func (l *p2pLogBackendWrapper) Log(level logging.Level, calldepth int, rec *logging.Record) error {
	module := l.logger.Named(rec.Module)
	switch level {
	case logging.DEBUG:
		module.Debug(rec.Message())
	case logging.WARNING:
		module.Warn(rec.Message())
	case logging.ERROR:
		module.Error(rec.Message())
	case logging.CRITICAL:
		module.Panic(rec.Message())
	case logging.NOTICE:
	case logging.INFO:
		module.Info(rec.Message())
	}

	return nil
}

func getP2PLogLevel(level zapcore.Level) logging.Level {
	switch level {
	case zap.DebugLevel:
		return logging.DEBUG
	case zap.InfoLevel:
		return logging.INFO
	case zap.WarnLevel:
		return logging.WARNING
	case zap.ErrorLevel:
		return logging.ERROR
	}

	return logging.CRITICAL
}

func setupLogger(logLevel string, mlogger Logger) error {
	var zapLogLevel zapcore.Level
	switch logLevel {
	case "debug":
		zapLogLevel = zap.DebugLevel
	case "info":
		zapLogLevel = zap.InfoLevel
	case "warn":
		zapLogLevel = zap.WarnLevel
	case "error":
		zapLogLevel = zap.ErrorLevel
	default:
		return fmt.Errorf("unknown log level: %q", logLevel)
	}

	// configure zap
	config := zap.NewDevelopmentConfig()
	config.Level.SetLevel(zapLogLevel)
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	l, err := config.Build()
	if err != nil {
		return err
	}

	consoleEncoder := zapcore.NewConsoleEncoder(config.EncoderConfig)
	mobile := zap.WrapCore(func(core zapcore.Core) zapcore.Core {
		return newMobileCore(core, consoleEncoder, mlogger)
	})

	zap.ReplaceGlobals(l.WithOptions(mobile))
	logger().Debug("logger initialized")

	// configure p2p log
	logging.SetBackend(&p2pLogBackendWrapper{
		logger: zap.L().Named("vendor.libp2p").WithOptions(zap.AddCallerSkip(4)),
	})
	if err := p2plog.SetLogLevel("*", getP2PLogLevel(zapLogLevel).String()); err != nil {
		logger().Warn("failed to set p2p log level", zap.Error(err))
	}
	return nil
}
