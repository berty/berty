package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	qrterminal "github.com/mdp/qrterminal/v3"
	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func shareInviteCommand() *ffcli.Command {
	var (
		shareOnDevChannelFlag = false
		noTerminalFlag        = false
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty share-invite", flag.ExitOnError)
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupLocalMessengerServerFlags(fs) // by default, start a new local messenger server,
		manager.SetupRemoteNodeFlags(fs)           // but allow to set a remote server instead
		fs.BoolVar(&shareOnDevChannelFlag, "dev-channel", shareOnDevChannelFlag, "post qrcode on dev channel")
		fs.BoolVar(&noTerminalFlag, "no-term", noTerminalFlag, "do not print the QR code in terminal")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "share-invite",
		ShortUsage:     "berty [global flags] share-invite [flags]",
		ShortHelp:      "share invite link on your terminal or in the dev channel on Discord",
		FlagSetBuilder: fsBuilder,
		Options:        []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			manager.DisableIPFSNetwork()

			// messenger
			messenger, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			// get shareable ID
			ret, err := messenger.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{DisplayName: manager.Node.Messenger.DisplayName})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if !noTerminalFlag {
				qrterminal.GenerateHalfBlock(ret.DeepLink, qrterminal.L, os.Stdout) // FIXME: show deeplink
			}
			fmt.Printf("html url: %s\n", ret.HTMLURL)
			// fmt.Printf("deeplink: %s\n", ret.DeepLink)
			if shareOnDevChannelFlag {
				_, err = messenger.DevShareInstanceBertyID(ctx, &bertymessenger.DevShareInstanceBertyID_Request{DisplayName: manager.Node.Messenger.DisplayName})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
			}
			return nil
		},
	}
}
