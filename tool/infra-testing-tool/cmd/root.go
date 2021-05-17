package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
)

var (
	File string

	rootCmd = &cobra.Command {
		Use: "infra",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("yahoo")
		},
	}
)

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(generateCmd)
	rootCmd.AddCommand(resourcesCmd)


	rootCmd.PersistentFlags().StringVarP(&File, "file", "f", "", "config file to generate from")

}

func Execute() error {
	return rootCmd.Execute()
}

func initConfig() {

}
