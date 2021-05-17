package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/configParse"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) error {
			b, err := configParse.OpenConfig(File)
			if err != nil {
				return err
			}
			err = configParse.Parse(b)
			if err != nil {
				return err
			}


			return nil
		},
	}
)


func Spoop(c configParse.Config) {

}

