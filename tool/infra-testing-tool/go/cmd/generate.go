package cmd

import (
	"fmt"
	"infratesting/config"

	"github.com/spf13/cobra"
)

var (
	generateCmd = &cobra.Command{
		Use: "generate",
		RunE: func(cmd *cobra.Command, args []string) (err error) {

			b, err := config.OpenConfig(File)
			if err != nil {
				return fmt.Errorf("unable to open config: %w", err)
			}

			hcl, y, err := config.OutputNormal(logger, b)
			if err != nil {
				return fmt.Errorf("unable to open config: %w", err)
			}

			err = writeFile(hcl, DefaultTFFile)
			if err != nil {
				return fmt.Errorf("unable to write Terraform file: %w", err)
			}

			err = writeFile(y, DefaultStateFile)
			if err != nil {
				return fmt.Errorf("unable to write State file: %w", err)
			}

			return nil
		},
	}
)
