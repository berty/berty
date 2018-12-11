package main

import (
	"fmt"
	"math/rand"
	"os"
	"strings"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"berty.tech/core"
	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/pkg/logmanager"
)

func setupRand(cmd *cobra.Command, args []string) error {
	randSeed, err := cmd.Flags().GetInt64("rand-seed")
	if err != nil {
		return err
	}
	if randSeed != 0 {
		rand.Seed(randSeed)
	}
	return nil
}

func newRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:           "berty",
		SilenceUsage:  true,
		SilenceErrors: true,
		Version: fmt.Sprintf(
			"core=%s p2p=%d node=%d git_sha=%s git_branch=%s git_tag=%s build_mode=%s commit_date=%s",
			core.Version, p2p.Version, node.Version, core.GitSha, core.GitBranch, core.GitTag, core.BuildMode, core.CommitDate(),
		),
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
			if err := setupRand(cmd, args); err != nil {
				return err
			}
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
	defaultJaegerName := os.Getenv("USER") + "@" + os.Getenv("HOST")
	cmd.PersistentFlags().BoolP("help", "h", false, "Print usage")
	cmd.PersistentFlags().StringP("log-level", "", "info", "log level (debug, info, warn, error)")
	cmd.PersistentFlags().StringP("log-namespaces", "", "core.*,vendor.gorm*", "logger namespaces to enable (supports wildcard)")
	cmd.PersistentFlags().StringP("log-dir", "", "/tmp/berty-logs", "local log files directory")
	cmd.PersistentFlags().StringP("jaeger-address", "", "127.0.0.1:6831", "ip address / hostname and port of jaeger-agent: <hostname>:<port>")
	cmd.PersistentFlags().StringP("jaeger-name", "", defaultJaegerName, "tracer name")
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

func setupLogger(cmd *cobra.Command, args []string) error {
	cfgLogLevel, err := cmd.Flags().GetString("log-level")
	if err != nil {
		return err
	}
	patternsString, err := cmd.Flags().GetString("log-namespaces")
	if err != nil {
		panic(err)
	}
	// local file
	logDir, err := cmd.Flags().GetString("log-dir")
	if err != nil {
		panic(err)
	}

	// start logmanager
	logman, err := logmanager.New(logmanager.Opts{
		RingSize:      10 * 1024 * 1024,
		LogLevel:      cfgLogLevel,
		LogNamespaces: patternsString,
		LogDirectory:  logDir,
	})
	if err != nil {
		return err
	}
	logman.SetGlobal()

	zap.L().Debug("logger initialized")
	return nil
}

var (
	jaegerAddr string
	jaegerName string
)

func setupJaeger(cmd *cobra.Command, args []string) (err error) {
	jaegerAddr, err = cmd.Flags().GetString("jaeger-address")
	if err != nil {
		return err
	}
	jaegerName, err = cmd.Flags().GetString("jaeger-name")
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
