package main

import (
	"context"
	"fmt"

	"github.com/peterbourgon/ff/v3/ffcli"
)

func versionCommand() *ffcli.Command {
	return &ffcli.Command{
		Name:      "version",
		ShortHelp: "print software version",
		Exec: func(_ context.Context, _ []string) error {
			fmt.Println("dev")
			return nil
		},
	}
}
