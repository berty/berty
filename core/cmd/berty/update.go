package main

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"berty.tech/core"
	"berty.tech/core/pkg/yolo"
)

type updateOptions struct {
}

func updateSetupFlags(flags *pflag.FlagSet, opts *updateOptions) {
	_ = viper.BindPFlags(flags)
}

func newUpdateCommand() *cobra.Command {
	opts := &updateOptions{}
	cmd := &cobra.Command{
		Use: "update",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := viper.Unmarshal(opts); err != nil {
				return err
			}
			return update(opts)
		},
	}

	updateSetupFlags(cmd.Flags(), opts)
	return cmd
}

func update(opts *updateOptions) error {
	release, err := yolo.LatestIOSMaster()
	if err != nil {
		return err
	}

	if release.IsMoreRecentThan(core.CommitDate()) {
		out, _ := json.MarshalIndent(release, "", "  ")
		fmt.Printf("new master update available: %s\n", string(out))
	} else {
		fmt.Println("you are already up to date")
	}

	return nil
}
