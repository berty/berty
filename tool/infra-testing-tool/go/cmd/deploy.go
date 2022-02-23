package cmd

import (
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/logging"
	infratesting "infratesting/testing"
	"os"
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/spf13/cobra"
)

var deployCmd = &cobra.Command{
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

		logging.Log("attempting to connect to peers' berty-infra-server")
		logging.Log("this could take a while ...")

		c, err := loadConfig()
		if err != nil {
			return logging.LogErr(err)
		}

		aws.SetRegion(c.Settings.Region)
		infratesting.SetDeploy()

		_, err = infratesting.GetAllEligiblePeers(aws.Ec2TagType, config.AllPeerTypes)
		if err != nil {
			return err
		} else {
			logging.Log("successfully connected to all peers")
			logging.Log("deployment is now complete")
		}

		return nil
	},
}
