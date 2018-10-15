package main

import (
	"fmt"
	"path"
	"strings"

	p2plog "github.com/ipfs/go-log"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	logging "github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"berty.tech/core"
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
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

func newRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "berty",
		Version: fmt.Sprintf("core=%s (p2p=%d, node=%d)", core.Version, p2p.Version, node.Version),
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if err := setupLogger(cmd, args); err != nil {
				return err
			}
			if err := setupViper(cmd, args); err != nil {
				return err
			}
			return nil
		},
	}

	cmd.PersistentFlags().BoolP("help", "h", false, "Print usage")
	cmd.PersistentFlags().StringP("log-level", "", "info", "log level (debug, info, warn, error)")
	cmd.PersistentFlags().StringP("log-namespaces", "", "core.*,vendor.gorm*", "logger namespaces to enable (supports wildcard)")

	cmd.AddCommand(
		newDaemonCommand(),
		newClientCommand(),
		newSQLCommand(),
		newIdentityCommand(),
	)

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))

	return cmd
}

func setupLogger(cmd *cobra.Command, args []string) error {
	cfgLogLevel, err := cmd.Flags().GetString("log-level")
	if err != nil {
		return err
	}

	var logLevel zapcore.Level
	switch cfgLogLevel {
	case "debug":
		logLevel = zap.DebugLevel
	case "info":
		logLevel = zap.InfoLevel
	case "warn":
		logLevel = zap.WarnLevel
	case "error":
		logLevel = zap.ErrorLevel
	default:
		return fmt.Errorf("unknown log level: %q", cfgLogLevel)
	}

	// configure zap
	config := zap.NewDevelopmentConfig()
	config.Level.SetLevel(logLevel)
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	l, err := config.Build()
	if err != nil {
		return err
	}
	filtered := zap.WrapCore(func(core zapcore.Core) zapcore.Core {
		matchMap := map[string]bool{}
		patternsString, err := cmd.Flags().GetString("log-namespaces")
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
	if err := p2plog.SetLogLevel("*", getP2PLogLevel(logLevel).String()); err != nil {
		logger().Warn("failed to set p2p log level", zap.Error(err))
	}
	return nil
}

func setupViper(cmd *cobra.Command, args []string) error {
	// configure viper
	viper.AddConfigPath(".")
	viper.SetConfigName(".berty")
	if err := viper.MergeInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return errors.Wrap(err, "failed apply viper config")
		}
	}
	return nil
}
