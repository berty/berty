package main

import (
	"context"
	"flag"
	"fmt"
	"runtime"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertyversion"
)

func versionCommand() *ffcli.Command {
	return &ffcli.Command{
		Name:       "version",
		ShortUsage: "berty version",
		ShortHelp:  "print software version",
		Options:    ffSubcommandOptions(),
		UsageFunc:  usageFunc,
		Exec: func(_ context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}
			fmt.Printf("version  %s\n", bertyversion.Version)
			if bertyversion.VcsRef != "n/a" {
				fmt.Printf("vcs      https://github.com/berty/berty/commits/%s\n", bertyversion.VcsRef)
			}
			fmt.Printf("go       %s\n", runtime.Version())
			return nil
		},
	}
}
