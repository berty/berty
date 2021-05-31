package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"infratesting/testing"
)

var (
	getIpsCmd = &cobra.Command{
		Use: "getIps",
		RunE: func(cmd *cobra.Command, args []string) error {
			s := testing.GetEc2Information()
			if len(s) > 0 {
				for _, i := range s {
					fmt.Println(i)
				}

 				return nil
			}

			fmt.Println("no running instances")

			return nil
		},
	}
)
