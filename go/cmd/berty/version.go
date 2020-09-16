package main

import (
	"context"
	"fmt"
	"runtime"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"github.com/peterbourgon/ff/v3/ffcli"
)

func versionCommand() *ffcli.Command {
	return &ffcli.Command{
		Name:      "version",
		ShortHelp: "print software version",
		Exec: func(_ context.Context, _ []string) error {
			fmt.Printf("git version  %s\n", bertymessenger.Version)
			if bertymessenger.VcsRef != "n/a" {
				fmt.Printf("vcs          https://github.com/berty/berty/commits/%s\n", bertymessenger.VcsRef)
			}
			fmt.Printf("go           %s\n", runtime.Version())
			return nil
		},
	}
}
