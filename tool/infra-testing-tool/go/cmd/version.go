package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/logging"
)

var (
	versionCmd = &cobra.Command{
		Use: "version",
		Run: func(cmd *cobra.Command, args []string) {
			logging.Log("version x.y.z")
		},
	}
)
