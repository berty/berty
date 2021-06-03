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

				fmt.Printf("%s, %s, %s, %s\n", name, nodeType, *instance.InstanceId, *instance.PublicIpAddress)
			}

			return nil

		},
	}
)
