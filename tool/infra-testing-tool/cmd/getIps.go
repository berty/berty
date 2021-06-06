// getIps prints out all the IPs of running nodes
// prints them grouped by state
// very useful when debugging or looking at state of instances

package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"infratesting/testing"
	"log"
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
				var name string
				var nodeType string

				for _, tag := range instance.Tags {
					if *tag.Key == "Name" {
						name = *tag.Value
					}

					if *tag.Key == "Type" {
						nodeType = *tag.Value
					}
				}

				s := fmt.Sprintf("%s, %s, %s, %s", name, nodeType, *instance.InstanceId, *instance.PublicIpAddress)

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
		fmt.Printf("%s:\n", category)
	}

	for _, item := range slice {
		fmt.Println(item)
	}
}
