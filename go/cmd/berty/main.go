package main

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"
	"os"
	"strings"
	"text/tabwriter"

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
		manager, err = initutil.New(ctx)
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
	// USAGE
	//   berty [global falgs] daemon [flags]
	//
	// STANDARD FLAGS
	//   -config ...                               blah
	//   -log.filters info+:bty*,-*.grpc error+:*  blah
	//
	// ADVANCED FLAGS
	//   -xxx                                      blah
	//   -yyy                                      blah
	//
	// EXAMPLES
	//   -zzz                                      blah

	var b strings.Builder

	/*

		fmt.Fprintf(&b, "USAGE\n")
		if c.ShortUsage != "" {
			fmt.Fprintf(&b, "  %s\n", c.ShortUsage)
		} else {
			fmt.Fprintf(&b, "  %s\n", c.Name)
		}
		fmt.Fprintf(&b, "\n")

		if c.LongHelp != "" {
			fmt.Fprintf(&b, "%s\n\n", c.LongHelp)
		}

		if len(c.Subcommands) > 0 {
			fmt.Fprintf(&b, "SUBCOMMANDS\n")
			tw := tabwriter.NewWriter(&b, 0, 2, 2, ' ', 0)
			for _, subcommand := range c.Subcommands {
				fmt.Fprintf(tw, "  %s\t%s\n", subcommand.Name, subcommand.ShortHelp)
			}
			tw.Flush()
			fmt.Fprintf(&b, "\n")
		}

		nFlags := 0
		stdFlags := tabwriter.NewWriter(&b, 0, 2, 2, ' ', 0)
		c.FlagSet.VisitAll(func(f *flag.Flag) {
			def := f.DefValue
			if def == "" {
				def = "..."
			}
			fmt.Fprintf(tw, "  -%s %s\t%s\n", f.Name, def, f.Usage)
		})
		c.FlagSet.VisitAll(func(*flag.Flag) { nFlags++ })
		if nFlags(c.FlagSet) > 0 {
			fmt.Fprintf(&b, "FLAGS\n")
			tw.Flush()
			fmt.Fprintf(&b, "\n")
		}

		return strings.TrimSpace(b.String())

		advanced := manager.AdvancedHelp()
		if advanced == "" {
			return ffcli.DefaultUsageFunc(c)
		}
		fmt.Fprintf(&b, "ADVANCED\n")
		return ffcli.DefaultUsageFunc(c) + "\n\n" + advanced
	*/

	return strings.TrimSpace(b.String())
}

func ffSubcommandOptions() []ff.Option {
	return []ff.Option{
		ff.WithEnvVarPrefix("BERTY"),
		ff.WithConfigFileFlag("config"),
		ff.WithConfigFileParser(ff.PlainParser),
	}
}
