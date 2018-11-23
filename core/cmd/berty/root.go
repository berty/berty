package main

import (
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
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
	"berty.tech/core/pkg/zapring"
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
		Use: "berty",
		Version: fmt.Sprintf(
			"core=%s p2p=%d node=%d git_sha=%s git_branch=%s git_tag=%s build_mode=%s commit_date=%s",
			core.Version, p2p.Version, node.Version, core.GitSha, core.GitBranch, core.GitTag, core.BuildMode, core.CommitDate(),
		),
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if err := setupLogger(cmd, args); err != nil {
				return err
			}
			if err := setupJaeger(cmd, args); err != nil {
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
	cmd.PersistentFlags().StringP("jaeger-address", "", "", "ip address / hostname and port of jaeger-agent: <hostname>:<port>")
	cmd.PersistentFlags().Int64P("rand-seed", "", 0, "seed used to initialize the default rand source")

	cmd.AddCommand(
		newDaemonCommand(),
		newClientCommand(),
		newSQLCommand(),
		newIdentityCommand(),
		newUpdateCommand(),
	)

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer("-", "_"))

	return cmd
}

var ring = zapring.New(10 * 1024 * 1024)

func setupLogger(cmd *cobra.Command, args []string) error {
	randSeed, err := cmd.Flags().GetInt64("rand-seed")
	if err != nil {
		return err
	}
	if randSeed != 0 {
		rand.Seed(randSeed)
	}

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

	patternsString, err := cmd.Flags().GetString("log-namespaces")
	if err != nil {
		panic(err)
	}

	// console core configuration
	consoleEncoderConfig := zap.NewDevelopmentEncoderConfig()
	consoleEncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	consoleEncoder := zapcore.NewConsoleEncoder(consoleEncoderConfig)

	consoleOutput := zapcore.Lock(os.Stderr)

	consoleLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return lvl >= logLevel
	})

	// console core creation with namespace filtering
	consoleCore := filteredzap.FilterByNamespace(
		zapcore.NewCore(consoleEncoder, consoleOutput, consoleLevel),
		patternsString,
	)

	// gRPC ring core configuration
	grpcRingEncoder := zapcore.NewJSONEncoder(zap.NewDevelopmentEncoderConfig())

	grpcRingOutput := zapcore.AddSync(ioutil.Discard)

	grpcRingLevel := zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
		return true
	})

	// gRPC ring core creation
	grpcRingCore := ring.Wrap(
		zapcore.NewCore(grpcRingEncoder, grpcRingOutput, grpcRingLevel),
		grpcRingEncoder,
	)

	// logger creation
	l := zap.New(
		zapcore.NewTee(consoleCore, grpcRingCore),
		zap.ErrorOutput(consoleOutput),
		zap.Development(),
		zap.AddCaller(),
	)
	zap.ReplaceGlobals(l)
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

var jaegerAddr string

func setupJaeger(cmd *cobra.Command, args []string) (err error) {
	jaegerAddr, err = cmd.Flags().GetString("jaeger-address")
	return
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
