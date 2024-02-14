package cmd

import (
	"context"
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
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		wd, err := os.Getwd()
		if err != nil {
			return err
		}

		var t testing.T
		terraformOptions := terraform.WithDefaultRetryableErrors(&t, &terraform.Options{
			TerraformDir: fmt.Sprintf("%s/%s", wd, DefaultFolderName),
			Logger:       logging.TerraformLogger(logger),
		})

		logger.Info("init and apply terrform file...")
		terraform.InitAndApply(&t, terraformOptions)
		if t.Failed() {
			logger.Fatal("something went wrong while applying")
		}

		c, err := loadConfig()
		if err != nil {
			return fmt.Errorf("unable to load config: %w", err)
		}

		logger.Info("attempting to connect to peers berty-infra-server")
		logger.Info("this could take a while ...")

		aws.SetRegion(c.Settings.Region)
		infratesting.SetDeploy()

		_, err = infratesting.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, config.AllPeerTypes)
		if err != nil {
			return fmt.Errorf("unable to get all eligible peers: %w", err)
		} else {
			logger.Info("successfully connected to all peers")
			logger.Info("deployment is now complete")
		}

		return nil
	},
}
