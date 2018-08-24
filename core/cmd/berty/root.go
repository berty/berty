package main

import (
	"fmt"

	p2plog "github.com/ipfs/go-log"
	"github.com/spf13/cobra"
	"github.com/whyrusleeping/go-logging"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"berty.tech/core"
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
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
		Use:               "berty",
		Version:           fmt.Sprintf("core=%s (p2p=%d, node=%d)", core.Version, p2p.Version, node.Version),
		PersistentPreRunE: setupLogger,
	}
	cmd.PersistentFlags().BoolP("help", "h", false, "Print usage")
	cmd.PersistentFlags().StringP("log-level", "", "info", "log level (debug, info, warn, error)")
	cmd.PersistentFlags().StringP("log-level-p2p", "", "", "Enable log on libp2p (can be 'critical', 'error', 'warning', 'notice', 'info', 'debug') will take log level by default")
	cmd.PersistentFlags().StringSliceP("log-p2p-subsystem", "", []string{}, "log libp2p specific subsystem")
	cmd.AddCommand(
		newDaemonCommand(),
		newClientCommand(),
		newSQLCommand(),
	)
	return cmd
}

func setupLogger(cmd *cobra.Command, args []string) error {
	cfgLogLevel, err := cmd.Flags().GetString("log-level")
	if err != nil {
		return err
	}

	cfgP2PLogLevel, err := cmd.Flags().GetString("log-level-p2p")
	if err != nil {
		return err
	}

	cfgP2PLogSubsystem, err := cmd.Flags().GetStringSlice("log-p2p-subsystem")
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

	config := zap.NewDevelopmentConfig()
	config.Level.SetLevel(logLevel)
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	l, err := config.Build()
	if err != nil {
		return err
	}
	zap.ReplaceGlobals(l)

	// configure p2p log
	logging.SetBackend(&p2pLogBackendWrapper{
		logger: zap.L().Named("vendor.libp2p").WithOptions(zap.AddCallerSkip(4)),
	})

	if cfgP2PLogLevel == "" {
		cfgP2PLogLevel = getP2PLogLevel(logLevel).String()
	} else if len(cfgP2PLogSubsystem) == 0 {
		cfgP2PLogSubsystem = append(cfgP2PLogSubsystem, "*")
	}

	// Set default p2plog to critical
	if err := p2plog.SetLogLevel("*", logging.INFO.String()); err != nil {
		return err
	}

	for _, subname := range cfgP2PLogSubsystem {
		if err := p2plog.SetLogLevel(subname, cfgP2PLogLevel); err != nil {
			return err
		}
	}

	logger().Debug("logger initialized")
	return nil
}
