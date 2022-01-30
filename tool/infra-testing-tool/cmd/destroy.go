package cmd

import (
	"fmt"
	"os"
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/spf13/cobra"
)

var (
	destroyCmd = &cobra.Command{
		Use: "destroy",
		RunE: func(cmd *cobra.Command, args []string) error {

			wd, err := os.Getwd()
			if err != nil {
				return err
			}

			var t testing.T
			terraformOptions := terraform.WithDefaultRetryableErrors(&t, &terraform.Options{
				TerraformDir: fmt.Sprintf("%s/%s", wd, DefaultFolderName),
			})

			terraform.Destroy(&t, terraformOptions)

			if t.Failed() {
				panic("something went wrong while destroying")
			}

			return nil
		},
	}
)
