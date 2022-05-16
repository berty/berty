package cmd

import (
	"infratesting/logging"

	"github.com/spf13/cobra"
)

var (
	File string

	rootCmd = &cobra.Command{
		Use: "infra",
		Run: func(cmd *cobra.Command, args []string) {
			logging.Log("nothing to see here \n	-> infra help")
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

	rootCmd.AddCommand(generateCmd)

	rootCmd.AddCommand(destroyCmd)
	rootCmd.AddCommand(deployCmd)
	rootCmd.AddCommand(testStartCmd)
	rootCmd.AddCommand(testStopCmd)
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(testRunAndStopCmd)
	rootCmd.AddCommand(getIpsCmd)
}

func Execute() error {
	return rootCmd.Execute()
}
