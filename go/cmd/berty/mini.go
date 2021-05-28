package main

import (
	"context"
	"flag"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/cmd/berty/mini"
)

func miniCommand() *ffcli.Command {
	var groupFlag string
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty mini", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		fs.StringVar(&groupFlag, "mini.group", groupFlag, "group to join, leave empty to create a new group")
		manager.Session.Kind = "cli.mini"
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupMetricsFlags(fs)              // add flags to enable metrics
		manager.SetupLocalMessengerServerFlags(fs) // add flags to allow creating a full node in the same process
		manager.SetupEmptyGRPCListenersFlags(fs)   // by default, we don't want to expose gRPC server for mini
		manager.SetupRemoteNodeFlags(fs)           // mini can be run against an already running server
		manager.SetupInitTimeout(fs)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "mini",
		ShortHelp:      "start a terminal-based mini berty client (not fully compatible with the app)",
		ShortUsage:     "berty [global flags] mini [flags]",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			// mini does not support stderr logging
			manager.Logging.StderrFilters = ""

			// logger
			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}
			miniLogger := logger.Named("mini")

			// messenger client
			messengerClient, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			// protocol client
			protocolClient, err := manager.GetProtocolClient()
			if err != nil {
				return err
			}

			lcmanager := manager.GetLifecycleManager()

			return mini.Main(ctx, &mini.Opts{
				GroupInvitation:  groupFlag,
				MessengerClient:  messengerClient,
				ProtocolClient:   protocolClient,
				Logger:           miniLogger,
				DisplayName:      manager.Node.Messenger.DisplayName,
				LifecycleManager: lcmanager,
			})
		},
	}
}
