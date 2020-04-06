package ipfsutil

import (
	p2plog "github.com/ipfs/go-log"
	"github.com/pkg/errors"
	logging "github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
)

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
	case logging.INFO:
		module.Info(rec.Message())
	case logging.NOTICE:
	}

	return nil
}

func getP2PLogLevel(level string) logging.Level {
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

func ConfigureLogger(filter string, logger *zap.Logger, logLevel string) error {
	// Add CallerSkip to Show the original caller of the log
	logger = logger.WithOptions(zap.AddCallerSkip(4))

	logging.SetBackend(&p2pLogBackendWrapper{
		logger: logger.Named("lp2p"),
	})

	if err := p2plog.SetLogLevel(filter, getP2PLogLevel(logLevel).String()); err != nil {
		return errors.Wrap(err, "failed to set p2p log level")
	}

	return nil
}
