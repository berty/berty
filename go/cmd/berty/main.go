package main

import (
	"context"
	"flag"
	"log"
	"os"

	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
)

var opts mainOpts

func main() {
	log.SetFlags(0)
	opts = newMainOpts()

	var globalFlags = flag.NewFlagSet("berty", flag.ExitOnError)
	globalFlags.BoolVar(&opts.debug, "debug", opts.debug, "berty debug mode")
	globalFlags.BoolVar(&opts.libp2pDebug, "debug-p2p", opts.libp2pDebug, "libp2p debug mode")
	globalFlags.BoolVar(&opts.orbitDebug, "debug-odb", opts.orbitDebug, "orbitdb debug mode")
	globalFlags.BoolVar(&opts.poiDebug, "debug-poi", opts.poiDebug, "peer-of-interest debug mode")
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

	if err := root.ParseAndRun(ctx, os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}
