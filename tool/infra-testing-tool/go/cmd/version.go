package cmd

import (
	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var (
	versionCmd = &cobra.Command{
		Use: "version",
		Run: func(cmd *cobra.Command, args []string) {
			logger.Debug("infra", zap.String("version", "z.y.z"))
		},
	}
)
