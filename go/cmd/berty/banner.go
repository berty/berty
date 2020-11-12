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
		lightFlag  = false
		randomFlag = false
	)

	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("banner", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.SetupLoggingFlags(fs) // also available at root level
		fs.BoolVar(&lightFlag, "light", lightFlag, "light mode")
		fs.BoolVar(&randomFlag, "random", randomFlag, "pick a random quote")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "banner",
		ShortUsage:     "berty banner [flags]",
		ShortHelp:      "print the Berty banner of the day",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

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
