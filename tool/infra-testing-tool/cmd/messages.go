package cmd

import (
	"github.com/spf13/cobra"
)

var (
	messagesCmd = &cobra.Command{
		Use: "messages",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
)
