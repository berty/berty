package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"infratesting/config"
	"strings"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) (err error) {

			b, err := config.OpenConfig(File)
			if err != nil {
				return err
			}

			var output string

			switch strings.ToLower(OutputFmt) {
			case OutputFmtHCL:
				output, err = config.OutputHcl(b)
			case OutputFmtJson:
				output, err = config.OutputJson(b)
			case OutputFmtYaml:
				output, err = config.OutputYaml(b)
			default:
				output, err = config.OutputHcl(b)
			}

			if err != nil {
				return err
			}

			fmt.Println(output)
			return nil
		},
	}
)


