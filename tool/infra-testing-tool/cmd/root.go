package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
)

var (
	File      string
	OutputFmt string

	rootCmd = &cobra.Command{
		Use: "infra",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("yahoo")
		},
	}
)

const (
	fileUsage = "config file to generate infra from"

	OutputFmtUsage = "select output format (JSON/YAML/HCL)"
	OutputFmtHCL   = "hcl"
	OutputFmtYaml  = "yaml"
	OutputFmtJson  = "json"
)

func init() {
	cobra.OnInitialize(initConfig)

	generateCmd.Flags().StringVarP(&File, "file", "f", "", fileUsage)
	generateCmd.Flags().StringVarP(&OutputFmt, "output-format", "o", "", OutputFmtUsage)
	_ = generateCmd.MarkFlagRequired("file")
	configCmd.AddCommand(generateCmd)

	rootCmd.AddCommand(configCmd)

	resourcesCmd.Flags().StringVarP(&File, "file", "f", "", fileUsage)
	_ = configCmd.MarkFlagRequired("file")
	rootCmd.AddCommand(resourcesCmd)

	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(getIpsCmd)
	rootCmd.AddCommand(groupCmd)

}

func Execute() error {
	return rootCmd.Execute()
}

func initConfig() {

}
