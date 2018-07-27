package main

import "github.com/spf13/cobra"

func newDaemonCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use: "daemon",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
	return cmd
}
