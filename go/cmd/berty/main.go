package main

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"
	"os"
	"strings"

	"github.com/oklog/run"
	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

var manager *initutil.Manager

func main() {
	err := runMain(os.Args[1:])
	switch {
	case err == nil:
		// noop
	case err == flag.ErrHelp || strings.Contains(err.Error(), flag.ErrHelp.Error()):
		os.Exit(2)
	default:
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

func runMain(args []string) error {
	mrand.Seed(srand.MustSecure())
	ctx, ctxCancel := context.WithCancel(context.Background())
	defer ctxCancel()

	// init manager
	{
		var err error
		manager, err = initutil.New(ctx, nil)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		defer manager.Close(nil)
	}

	guiCmd, guiInit := guiCommand()

	// root command
	var root *ffcli.Command
	{
		fs := flag.NewFlagSet("berty", flag.ContinueOnError)
		manager.SetupLoggingFlags(fs)

		root = &ffcli.Command{
			ShortUsage: "berty [global flags] <subcommand> [flags] [args...]",
			FlagSet:    fs,
			Options: []ff.Option{
				ff.WithEnvVarPrefix("BERTY"),
			},
			Exec:      func(context.Context, []string) error { return flag.ErrHelp },
			UsageFunc: usageFunc,
			Subcommands: []*ffcli.Command{
				daemonCommand(),
				accountDaemonCommand(),
				miniCommand(),
				bannerCommand(),
				versionCommand(),
				systemInfoCommand(),
				groupinitCommand(),
				shareInviteCommand(),
				tokenServerCommand(),
				replicationServerCommand(),
				peersCommand(),
				exportCommand(),
				omnisearchCommand(),
				remoteLogsCommand(),
				serviceKeyCommand(),
				pushServerCommand(),
			},
		}

		if guiCmd != nil {
			root.Subcommands = append(root.Subcommands, guiCmd)
		}
	}

	run := func() error {
		// create run.Group
		var process run.Group
		{
			// handle close signal
			execute, interrupt := run.SignalHandler(ctx, os.Interrupt)
			process.Add(execute, interrupt)

			// add root command to process
			process.Add(func() error {
				return root.ParseAndRun(ctx, args)
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

	if guiInit != nil && len(args) > 0 && args[0] == "gui" { // can't check subcommand after Parse
		ech := make(chan error)
		defer close(ech)

		go func() {
			ech <- run()
		}()
		if err := guiInit(); err != nil {
			return err
		}
		return <-ech
	}

	return run()
}

func usageFunc(c *ffcli.Command) string {
	advanced := manager.AdvancedHelp()
	if advanced == "" {
		return ffcli.DefaultUsageFunc(c)
	}
	return ffcli.DefaultUsageFunc(c) + "\n\n" + advanced
}

func ffSubcommandOptions() []ff.Option {
	return []ff.Option{
		ff.WithEnvVarPrefix("BERTY"),
		ff.WithConfigFileFlag("config"),
		ff.WithConfigFileParser(ff.PlainParser),
	}
}
