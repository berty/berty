package main

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"
	"os"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/oklog/run"
	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/srand"
)

var manager *initutil.Manager

func main() {
	err := runMain()
	if err != nil {
		if err != flag.ErrHelp {
			fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		}
		os.Exit(1)
	}
}

func runMain() error {
	mrand.Seed(srand.Secure())
	ctx, ctxCancel := context.WithCancel(context.Background())
	defer ctxCancel()

	// init manager
	{
		var err error
		manager, err = initutil.New(ctx)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		defer manager.Close()
	}

	// root command
	var root *ffcli.Command
	{
		var fs = flag.NewFlagSet("berty", flag.ExitOnError)
		manager.SetupLoggingFlags(fs)

		root = &ffcli.Command{
			ShortUsage: "berty [global flags] <subcommand> [flags] [args...]",
			FlagSet:    fs,
			Options:    []ff.Option{ff.WithEnvVarPrefix("BERTY")},
			Exec:       func(context.Context, []string) error { return flag.ErrHelp },
			Subcommands: []*ffcli.Command{
				daemonCommand(),
				miniCommand(),
				bannerCommand(),
				versionCommand(),
				systemInfoCommand(),
				groupinitCommand(),
				shareInviteCommand(),
				tokenServerCommand(),
			},
		}
	}

	// create run.Group
	var process run.Group
	{
		// handle close signal
		execute, interrupt := run.SignalHandler(ctx, os.Interrupt)
		process.Add(execute, interrupt)

		// add root command to process
		process.Add(func() error {
			return root.ParseAndRun(ctx, os.Args[1:])
		}, func(error) {
			ctxCancel()
		})
	}

	// start the run.Group process
	{
		err := process.Run()
		if err == context.Canceled {
			return nil
		}
		return err
	}
}
