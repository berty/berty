package cmd

import (
	"infratesting/logging"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	File string

	verbose bool
	logger  = zap.NewNop()
	rootCmd = &cobra.Command{
		Use: "infra",
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			if verbose {
				logger = logging.New(zapcore.DebugLevel)
			} else {
				logger = logging.New(zapcore.InfoLevel)
			}
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
)

const (
	fileUsage = "config file to generate infra from"

	DefaultFolderName = "infraState"
	DefaultTFFile     = DefaultFolderName + "/private.tf"
	DefaultStateFile  = DefaultFolderName + "/state.yaml"
)

func init() {

	cobra.OnInitialize()

	generateCmd.Flags().StringVarP(&File, "file", "f", "", fileUsage)
	_ = generateCmd.MarkFlagRequired("file")

	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "enable verbose mode")

	rootCmd.AddCommand(generateCmd)
	rootCmd.AddCommand(destroyCmd)
	rootCmd.AddCommand(deployCmd)
	rootCmd.AddCommand(testStartCmd)
	rootCmd.AddCommand(testStopCmd)
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(testRunAndStopCmd)
	rootCmd.AddCommand(getIpsCmd)
}

func Execute() (err error) {
	if err = rootCmd.Execute(); err != nil {
		logger.Error("failed execute command", zap.Error(err))
	}
	return
}
