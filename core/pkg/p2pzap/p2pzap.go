package p2pzap

import (
	p2plog "github.com/ipfs/go-log"
	"github.com/pkg/errors"
	logging "github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type p2pLogBackendWrapper struct {
	logger *zap.Logger
}

func (l *p2pLogBackendWrapper) Log(level logging.Level, calldepth int, rec *logging.Record) error {
	module := l.logger.Named("lp2p." + rec.Module)
	switch level {
	case logging.DEBUG:
		module.Debug(rec.Message())
	case logging.WARNING:
		module.Warn(rec.Message())
	case logging.ERROR:
		module.Error(rec.Message())
	case logging.CRITICAL:
		module.Panic(rec.Message())
	case logging.INFO:
		module.Info(rec.Message())
	case logging.NOTICE:
	}

	return nil
}

func GetP2PLogLevelFromZap(level zapcore.Level) logging.Level {
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

func GetP2PLogLevel(level string) logging.Level {
	switch level {
	case "debug":
		return logging.DEBUG
	case "info":
		return logging.INFO
	case "warn":
		return logging.WARNING
	case "error":
		return logging.ERROR
	}
	return logging.CRITICAL
}

func Configure(logger *zap.Logger, logLevel string) error {
	logging.SetBackend(&p2pLogBackendWrapper{
		logger: logger,
	})
	if err := p2plog.SetLogLevel("*", GetP2PLogLevel(logLevel).String()); err != nil {
		return errors.Wrap(err, "failed to set p2p log level")
	}
	return nil
}
