package main

import (
	"fmt"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/berty/berty/core"
	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/p2p"
)

func newRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:               "berty",
		Version:           fmt.Sprintf("core=%s (p2p=%d, node=%d)", core.Version, p2p.Version, node.Version),
		PersistentPreRunE: setupLogger,
	}
	cmd.PersistentFlags().BoolP("help", "h", false, "Print usage")
	cmd.PersistentFlags().StringP("log-level", "", "info", "log level (debug, info, warn, error)")
	cmd.AddCommand(
		newDaemonCommand(),
		newClientCommand(),
		newUICommand(),
	)
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
	config := zap.NewDevelopmentConfig()
	config.Level.SetLevel(logLevel)
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		return err
	}
	zap.ReplaceGlobals(logger)
	zap.L().Debug("logger initialized")
	return nil
}
