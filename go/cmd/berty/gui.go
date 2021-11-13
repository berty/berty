//go:build bertygui
// +build bertygui

package main

import (
	"context"
	"flag"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/cmd/berty/gui"
)

func guiCommand() (*ffcli.Command, func() error) {
	var groupFlag string
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty gui", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.Session.Kind = "cli.gui"
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupMetricsFlags(fs)              // add flags to enable metrics
		manager.SetupLocalMessengerServerFlags(fs) // add flags to allow creating a full node in the same process
		manager.SetupEmptyGRPCListenersFlags(fs)   // by default, we don't want to expose gRPC server for gui
		manager.SetupRemoteNodeFlags(fs)           // gui can be run against an already running server
		manager.SetupInitTimeout(fs)
		return fs, nil
	}

	ach := make(chan fyne.App, 1)

	init := func() error {
		a := app.New()
		ach <- a
		a.Run()
		return nil
	}

	return &ffcli.Command{
		Name:           "gui",
		ShortHelp:      "start an experimental fyne-based berty client, not officially supported",
		ShortUsage:     "berty [global flags] gui [flags]",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			// logger
			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}
			guiLogger := logger.Named("gui")

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

			return gui.Main(ctx, &gui.Opts{
				GroupInvitation:  groupFlag,
				MessengerClient:  messengerClient,
				ProtocolClient:   protocolClient,
				Logger:           guiLogger,
				DisplayName:      manager.Node.Messenger.DisplayName,
				LifecycleManager: lcmanager,
				AppChan:          ach,
			})
		},
	}, init
}
