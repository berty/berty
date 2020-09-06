package main

import (
	"context"
	"flag"
	"log"
	"os"

	"github.com/oklog/run"
	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
)

var opts mainOpts

func main() {
	log.SetFlags(0)
	opts = newMainOpts()

	var globalFlags = flag.NewFlagSet("berty", flag.ExitOnError)
	globalFlags.StringVar(&opts.logFilters, "logfilters", opts.logFilters, "logged namespaces")
	globalFlags.StringVar(&opts.logToFile, "logfile", opts.logToFile, "if specified, will log everything in JSON into a file and nothing on stderr")
	globalFlags.StringVar(&opts.logFormat, "logformat", opts.logFormat, "if specified, will override default log format")
	globalFlags.StringVar(&opts.tracer, "tracer", opts.tracer, `specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger`)
	globalFlags.BoolVar(&opts.localDiscovery, "localdiscovery", opts.localDiscovery, "local discovery")

	root := &ffcli.Command{
		ShortUsage: "berty [global flags] <subcommand> [flags] [args...]",
		FlagSet:    globalFlags,
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
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var process run.Group

	// handle close signal
	execute, interrupt := run.SignalHandler(ctx, os.Interrupt)
	process.Add(execute, interrupt)

	// add root command to process
	process.Add(func() error {
		return root.ParseAndRun(ctx, os.Args[1:])
	}, func(error) {
		cancel()
	})

	// run process
	if err := process.Run(); err != nil && err != context.Canceled {
		log.Fatalf("error: %v", err)
	}
}
