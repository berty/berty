package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/config"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) (err error) {

			b, err := config.OpenConfig(File)
			if err != nil {
				return err
			}

			hcl, y, err := config.OutputNormal(b)
			if err != nil {
				return err
			}

			err = writeFile(hcl, DefaultTFFile)
			if err != nil {
				return err
			}

			err = writeFile(y, DefaultStateFile)
			if err != nil {
				return err
			}

			return nil
		},
	}
)
