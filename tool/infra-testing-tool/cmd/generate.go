package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/config"
	"strings"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) error {

			b, err := config.OpenConfig(File)
			if err != nil {
				return err
			}

			switch strings.ToLower(OutputFmt) {
			case OutputFmtHCL:
				return config.OutputHcl(b)
			case OutputFmtJson:
				return config.OutputJson(b)
			case OutputFmtYaml:
				return config.OutputYaml(b)
			default:
				return config.OutputHcl(b)
			}
		},
	}
)
