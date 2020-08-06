package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	datastore "github.com/ipfs/go-datastore"
	"github.com/mdp/qrterminal/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
)

func shareInviteCommand() *ffcli.Command {
	var shareInviteFlags = flag.NewFlagSet("dev share-invite", flag.ExitOnError)
	shareInviteFlags.BoolVar(&opts.shareInviteOnDev, "dev-channel", opts.shareInviteOnDev, "post qrcode on dev channel")
	shareInviteFlags.BoolVar(&opts.shareInviteReset, "reset", opts.shareInviteReset, "reset contact reference")
	shareInviteFlags.BoolVar(&opts.shareInviteNoTerminal, "no-term", opts.shareInviteNoTerminal, "do not print the QR code in terminal")
	shareInviteFlags.StringVar(&opts.datastorePath, "d", opts.datastorePath, "datastore base directory")

	return &ffcli.Command{
		Name:      "share-invite",
		ShortHelp: "share invite link to Discord dedicated channel",
		FlagSet:   shareInviteFlags,
		Exec: func(ctx context.Context, args []string) error {
			cleanup := globalPreRun()
			defer cleanup()

			// protocol
			var protocol bertyprotocol.Service
			{
				rootDS, dsLock, err := getRootDatastore(opts.datastorePath)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if dsLock != nil {
					defer func() { _ = dsLock.Unlock() }()
				}
				defer rootDS.Close()
				deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
				opts := bertyprotocol.Opts{
					Logger:         opts.logger.Named("bertyprotocol"),
					RootDatastore:  rootDS,
					DeviceKeystore: bertyprotocol.NewDeviceKeystore(deviceDS),
				}
				protocol, err = bertyprotocol.New(ctx, opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer protocol.Close()
			}
			protocolClient, err := bertyprotocol.NewClient(ctx, protocol)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			messenger, err := bertymessenger.New(protocolClient, &bertymessenger.Opts{Logger: opts.logger.Named("messenger"), ProtocolService: protocol})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			ret, err := messenger.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{DisplayName: opts.displayName})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if !opts.shareInviteNoTerminal {
				qrterminal.GenerateHalfBlock(ret.DeepLink, qrterminal.L, os.Stdout) // FIXME: show deeplink
			}
			fmt.Printf("deeplink: %s\n", ret.DeepLink)
			fmt.Printf("html url: %s\n", ret.HTMLURL)
			if opts.shareInviteOnDev {
				_, err = messenger.DevShareInstanceBertyID(ctx, &bertymessenger.DevShareInstanceBertyID_Request{DisplayName: opts.displayName})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
			}
			return nil
		},
	}
}
