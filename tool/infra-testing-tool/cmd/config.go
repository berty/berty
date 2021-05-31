package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"infratesting/configParse"
)

var (
	configCmd = &cobra.Command{
		Use: "config",
		RunE: func(cmd *cobra.Command, args []string) error {
			b, err := configParse.OpenConfig(File)
			if err != nil {
				return err
			}
			err = configParse.Parse(b)
			if err != nil {
				return err
			}

			s, err := configParse.GetConfigMarshalled()
			if err != nil {
				return err
			}

			fmt.Println(s)

			return err
		},
	}
)
