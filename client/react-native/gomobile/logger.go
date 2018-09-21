package core

import (
	"fmt"
	"path"
	"strings"

	p2plog "github.com/ipfs/go-log"
	"github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"berty.tech/core/pkg/filteredzap"
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

func setupLogger(logLevel, logNamespaces string) error {
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
	filtered := zap.WrapCore(func(core zapcore.Core) zapcore.Core {
		matchMap := map[string]bool{}
		patternsString := logNamespaces
		if err != nil {
			panic(err)
		}
		patterns := strings.Split(patternsString, ",")
		return filteredzap.NewFilteringCore(core, func(entry zapcore.Entry, fields []zapcore.Field) bool {
			// always print error messages
			if entry.Level >= zapcore.ErrorLevel {
				return true
			}
			// only show debug,info,warn messages for enabled --log-namespaces
			if _, found := matchMap[entry.LoggerName]; !found {
				matchMap[entry.LoggerName] = false
				for _, pattern := range patterns {
					if matched, _ := path.Match(pattern, entry.LoggerName); matched {
						matchMap[entry.LoggerName] = true
						break
					}
				}
			}
			return matchMap[entry.LoggerName]
		})
	})
	zap.ReplaceGlobals(l.WithOptions(filtered))
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
