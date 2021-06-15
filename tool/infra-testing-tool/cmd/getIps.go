// getIps prints out all the IPs of running nodes
// prints them grouped by state
// very useful when debugging or looking at state of instances

package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	iacec2 "infratesting/iac/components/ec2"
	"infratesting/testing"
	"log"
	"strings"
)

var (
	getIpsCmd = &cobra.Command{
		Use: "getIps",
		RunE: func(cmd *cobra.Command, args []string) error {

			var states = make(map[string][]string)

			instances, err := testing.DescribeInstances()
			if err != nil {
				return err
			}

			if len(instances) == 0 {
				log.Println("no running instances")
				return nil
			}

			for _, instance := range instances {
				var name, nodeType string
				var instanceId = "No ID"
				var publicIpAddress = "No IP"

				for _, tag := range instance.Tags {
					if *tag.Key == iacec2.Ec2TagName {
						name = *tag.Value
					}

					if *tag.Key == iacec2.Ec2TagType {
						nodeType = *tag.Value
					}
				}

				if *instance.InstanceId != "" {
					instanceId = *instance.InstanceId
				}

				if *instance.State.Name == "running" || *instance.State.Name == "pending" {
					publicIpAddress = *instance.PublicIpAddress
				}

				s := fmt.Sprintf("%s, %s, %s, %s", name, nodeType, instanceId, publicIpAddress)

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
