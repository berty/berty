package main

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

type uiOptions struct {
	daemon  daemonOptions
	address string
}

func uiSetupFlags(flags *pflag.FlagSet, opts *uiOptions) {
	flags.StringVarP(&opts.address, "address", "", ":process:", "daemon gRPC address (ip:port), use :process: to start a daemon instance alongide the UI")
}

func newUICommand() *cobra.Command {
	opts := &uiOptions{}
	cmd := &cobra.Command{
		Use: "ui",
		RunE: func(cmd *cobra.Command, args []string) error {
			return ui(opts)
		},
	}

	flags := cmd.Flags()
	daemonSetupFlags(flags, &opts.daemon)
	uiSetupFlags(flags, opts)
	return cmd
}

func ui(opts *uiOptions) error {
	fmt.Println(opts)
	return nil
}
