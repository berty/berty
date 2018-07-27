package main

import "github.com/spf13/cobra"

func newClientCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use: "client",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
	return cmd
}
