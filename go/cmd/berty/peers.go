package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/godev"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func peersCommand() *ffcli.Command {
	refreshEveryFlag := time.Second
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("peers", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.SetupLoggingFlags(fs)             // also available at root level
		manager.SetupLocalProtocolServerFlags(fs) // by default, start a new local messenger server,
		manager.SetupRemoteNodeFlags(fs)          // but allow to set a remote server instead
		fs.DurationVar(&refreshEveryFlag, "peers.refresh", refreshEveryFlag, "refresh every DURATION (0: no refresh)")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "peers",
		ShortUsage:     "berty [global flags] peers [flags]",
		ShortHelp:      "list peers",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			// messenger client
			protocol, err := manager.GetProtocolClient()
			if err != nil {
				return err
			}

			for {
				ret, err := protocol.PeerList(ctx, &protocoltypes.PeerList_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if refreshEveryFlag == 0 {
					fmt.Println(godev.PrettyJSONPB(ret))
					break
				}

				// clear screen
				print("\033[H\033[2J")
				// FIXME: implement an ascii-table version of this view
				fmt.Println(godev.PrettyJSONPB(ret))
				time.Sleep(refreshEveryFlag)
			}

			return nil
		},
	}
}
