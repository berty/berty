package cmd

import (
	"fmt"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/spf13/cobra"
	"infratesting/config"
	"infratesting/iac/components/ec2"
	infratesting "infratesting/testing"
	"log"
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

			infratesting.SetDeploy()

			log.Println("attempting to connect to peers' infra-daemons")
			log.Println("this could take a while ...")

			_, err = infratesting.GetAllEligiblePeers(ec2.Ec2TagType, config.AllPeerTypes)
			if err != nil {
				return err
			} else {
				log.Println("successfully connected to all peers")
				log.Println("deployment is now complete")
			}




			//
			//for _, peer := range peers {
			//	fmt.Println(peer.Name)
			//}
			return nil
		},
	}
)
