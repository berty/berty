package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/config"
)

var (
	resourcesCmd = &cobra.Command{
		Use: "resources",
		RunE: func(cmd *cobra.Command, args []string) error {
			b, err := config.OpenConfig(File)
			if err != nil {
				return err
			}
			_, _, err = config.Parse(b)
			if err != nil {
				return err
			}

			//fmt.Printf("%+v\n", c)

			return nil
		},
	}
)
