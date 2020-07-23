package main

import (
	"context"
	"flag"
	"fmt"

	"berty.tech/berty/v2/go/pkg/banner"
	"github.com/peterbourgon/ff/v3/ffcli"
)

func bannerCommand() *ffcli.Command {
	var bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
	bannerFlags.BoolVar(&opts.bannerLight, "light", opts.bannerLight, "light mode")
	bannerFlags.BoolVar(&opts.bannerRandom, "random", opts.bannerRandom, "pick a random quote")

	return &ffcli.Command{
		Name:       "banner",
		ShortUsage: "banner",
		FlagSet:    bannerFlags,
		ShortHelp:  "print the ascii Berty banner of the day",
		Exec: func(ctx context.Context, args []string) error {
			cleanup := globalPreRun()
			defer cleanup()

			quote := banner.QOTD()
			if opts.bannerRandom {
				quote = banner.RandomQuote()
			}

			if opts.bannerLight {
				fmt.Println(quote)
			} else {
				fmt.Println(banner.Say(quote.String()))
			}
			return nil
		},
	}
}
