package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/configParse"
	"strings"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) error {

			b, err := configParse.OpenConfig(File)
			if err != nil {
				return err
			}

			switch strings.ToLower(OutputFmt) {
			case OutputFmtHCL:
				return configParse.OutputHcl(b)
			case OutputFmtJson:
				return configParse.OutputJson(b)
			case OutputFmtYaml:
				return configParse.OutputYaml(b)
			default:
				return configParse.OutputHcl(b)
			}
		},
	}
)
