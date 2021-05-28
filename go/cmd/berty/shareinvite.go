package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func shareInviteCommand() *ffcli.Command {
	var (
		shareOnDevChannelFlag = false
		noQRFlag              = false
		nameFlag              = ""
		passphraseFlag        = ""
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty share-invite", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		// manager.Node.Preset = initutil.NoNetPreset
		manager.Session.Kind = "cli.share-invite"
		manager.Logging.StderrFilters = "error+:*"
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupLocalMessengerServerFlags(fs) // by default, start a new local messenger server,
		manager.SetupRemoteNodeFlags(fs)           // but allow to set a remote server instead
		fs.StringVar(&nameFlag, "name", "", "override display name")
		fs.StringVar(&passphraseFlag, "passphrase", passphraseFlag, "optional sharing-link encryption passphrase")
		fs.BoolVar(&shareOnDevChannelFlag, "dev-channel", shareOnDevChannelFlag, "post qrcode on dev channel")
		fs.BoolVar(&noQRFlag, "no-qr", noQRFlag, "do not print the QR code in terminal")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "share-invite",
		ShortUsage:     "berty [global flags] share-invite [flags]",
		ShortHelp:      "share invite link on your terminal or in the dev channel on Discord",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
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

			// override display name
			name := manager.Node.Messenger.DisplayName
			if nameFlag != "" {
				name = nameFlag
			}

			// get shareable ID
			ret, err := messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{
				DisplayName: name,
				Passphrase:  []byte(passphraseFlag),
			})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			fmt.Println(ret.WebURL)
			if !noQRFlag {
				fmt.Fprintln(os.Stderr, ret.InternalURL)
				qrterminal.GenerateHalfBlock(ret.InternalURL, qrterminal.L, os.Stderr)
			}
			if shareOnDevChannelFlag {
				_, err = messenger.DevShareInstanceBertyID(ctx, &messengertypes.DevShareInstanceBertyID_Request{DisplayName: name})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
			}
			return nil
		},
	}
}
