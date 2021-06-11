package cmd

import (
	"fmt"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/spf13/cobra"
	"os"
	"testing"
)

var (
	deployCmd = &cobra.Command{
		Use: "deploy",
		RunE: func(cmd *cobra.Command, args []string) error {

			wd, err := os.Getwd()
			if err != nil {
				return err
			}

			var t testing.T
			terraformOptions := terraform.WithDefaultRetryableErrors(&t, &terraform.Options{
				TerraformDir: fmt.Sprintf("%s/%s", wd, DefaultFolderName),
			})

			terraform.InitAndApply(&t, terraformOptions)

			if t.Failed() {
				panic("something went wrong while applying")
			}

			return nil
		},
	}
)
