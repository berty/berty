package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"berty.tech/go/internal/banner"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
)

func main() {
	log.SetFlags(0)

	var (
		globalFlags = flag.NewFlagSet("bertychat", flag.ExitOnError)
		globalDebug = globalFlags.Bool("debug", false, "debug mode")
		bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight = bannerFlags.Bool("light", false, "light mode")
	)

	globalPreRun := func() error {
		if *globalDebug {
			log.Print("debug enabled")
			// here: configure the logger
		}
		return nil
	}

	banner := &ffcli.Command{
		Name:    "banner",
		Usage:   "banner",
		FlagSet: bannerFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}
			if *bannerLight {
				fmt.Println(banner.QOTD())
			} else {
				fmt.Println(banner.OfTheDay())
			}
			return nil
		},
	}

	version := &ffcli.Command{
		Name:  "version",
		Usage: "version",
		Exec: func(args []string) error {
			fmt.Println("latest")
			return nil
		},
	}

	root := &ffcli.Command{
		Usage:       "bertychat [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{banner, version},
		Exec: func([]string) error {
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}
