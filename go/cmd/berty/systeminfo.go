package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	datastore "github.com/ipfs/go-datastore"
	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/godev"
)

func systemInfoCommand() *ffcli.Command {
	var systemInfoFlags = flag.NewFlagSet("info", flag.ExitOnError)
	systemInfoFlags.StringVar(&opts.datastorePath, "d", opts.datastorePath, "datastore base directory")
	systemInfoFlags.DurationVar(&opts.infoRefreshEvery, "refresh", opts.infoRefreshEvery, "refresh every DURATION (0: no refresh)")

	return &ffcli.Command{
		Name:      "info",
		ShortHelp: "display system info",
		FlagSet:   systemInfoFlags,
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

			for {
				ret, err := messenger.SystemInfo(ctx, &bertymessenger.SystemInfo_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if opts.infoRefreshEvery == 0 {
					fmt.Println(godev.PrettyJSONPB(ret))
					break
				}
				/// clear screen
				print("\033[H\033[2J")
				fmt.Println(godev.PrettyJSONPB(ret))
				time.Sleep(opts.infoRefreshEvery)
			}

			return nil
		},
	}
}
