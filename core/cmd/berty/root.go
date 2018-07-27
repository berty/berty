package main

import (
	"fmt"

	"github.com/berty/berty/core"
	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/p2p"
	"github.com/spf13/cobra"
)

func newRootCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "berty",
		Version: fmt.Sprintf("%s (p2p=%d, ui=%d)", core.Version, p2p.Version, node.Version),
	}
	cmd.PersistentFlags().BoolP("help", "h", false, "Print usage")
	cmd.AddCommand(
		newDaemonCommand(),
		newClientCommand(),
	)
	return cmd
}
