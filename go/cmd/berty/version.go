package main

import (
	"context"
	"fmt"
	"runtime"

	"berty.tech/berty/v2/go/pkg/bertyversion"
	"github.com/peterbourgon/ff/v3/ffcli"
)

func versionCommand() *ffcli.Command {
	return &ffcli.Command{
		Name:      "version",
		ShortHelp: "print software version",
		Exec: func(_ context.Context, _ []string) error {
			fmt.Printf("version  %s\n", bertyversion.Version)
			if bertyversion.VcsRef != "n/a" {
				fmt.Printf("vcs      https://github.com/berty/berty/commits/%s\n", bertyversion.VcsRef)
			}
			fmt.Printf("go       %s\n", runtime.Version())
			return nil
		},
	}
}
