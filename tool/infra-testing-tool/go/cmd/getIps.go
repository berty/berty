// getIps prints out all the IPs of running nodes
// prints them grouped by state
// very useful when debugging or looking at state of instances

package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"infratesting/aws"
	"infratesting/logging"
	"strings"
)

var (
	getIpsCmd = &cobra.Command{
		Use: "getIps",
		RunE: func(cmd *cobra.Command, args []string) error {

			var states = make(map[string][]string)

			c, err := loadConfig()
			if err != nil {
				return logging.LogErr(err)
			}

			aws.SetRegion(c.Settings.Region)

			instances, err := aws.DescribeInstances()
			if err != nil {
				return err
			}

			if len(instances) == 0 {
				logging.Log("no running instances")
				return nil
			}

			for _, instance := range instances {
				var name, nodeType string
				var instanceId = "No ID"
				var ip = "No IP"

				for _, tag := range instance.Tags {
					if *tag.Key == aws.Ec2TagName {
						name = *tag.Value
					}

					if *tag.Key == aws.Ec2TagType {
						nodeType = *tag.Value
					}
				}

				if *instance.InstanceId != "" {
					instanceId = *instance.InstanceId
				}

				if *instance.State.Name == "running" || *instance.State.Name == "pending" {
					for _, ni := range instance.NetworkInterfaces {
						if ni.Association != nil {
							if *ni.Association.PublicIp != "" {
								ip = *ni.Association.PublicIp
								break
							}
						}
					}
				}

				s := fmt.Sprintf("%s, %s, %s, %s", name, nodeType, instanceId, ip)

				states[*instance.State.Name] = append(states[*instance.State.Name], s)
			}

			for key, value := range states {
				printAll(key, value)
			}

			return nil

		},
	}
)

func printAll(category string, slice []string) {
	if len(slice) > 0 {
		fmt.Printf("%s:\n", strings.ToUpper(category))
	}

	for _, item := range slice {
		fmt.Println(item)
	}
}
