package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/configParse"
)

var (
	resourcesCmd = &cobra.Command{
		Use: "resources",
		RunE: func(cmd *cobra.Command, args []string) error {
			b, err := configParse.OpenConfig(File)
			if err != nil {
				return err
			}
			err = configParse.Parse(b)
			if err != nil {
				return err
			}

			//fmt.Printf("%+v\n", c)

			return nil
		},
	}
)
