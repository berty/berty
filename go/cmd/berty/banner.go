package main

import (
	"context"
	"flag"
	"fmt"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/banner"
)

func bannerCommand() *ffcli.Command {
	var (
		fs         = flag.NewFlagSet("banner", flag.ExitOnError)
		lightFlag  = false
		randomFlag = false
	)
	fs.BoolVar(&lightFlag, "light", lightFlag, "light mode")
	fs.BoolVar(&randomFlag, "random", randomFlag, "pick a random quote")

	return &ffcli.Command{
		Name:       "banner",
		ShortUsage: "berty [global flags] banner [flags]",
		FlagSet:    fs,
		ShortHelp:  "print the Berty banner of the day",
		Exec: func(ctx context.Context, args []string) error {
			quote := banner.QOTD()
			if randomFlag {
				quote = banner.RandomQuote()
			}

			if lightFlag {
				fmt.Println(quote)
			} else {
				fmt.Println(banner.Say(quote.String()))
			}
			return nil
		},
	}
}
