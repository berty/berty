package main

import (
	"context"
	"flag"
	"fmt"
	"io"

	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func remoteLogsCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty remote-logs", flag.ExitOnError)
		manager.SetupRemoteNodeFlags(fs)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "remote-logs",
		ShortUsage:     "berty [global flags] remote-logs",
		ShortHelp:      "stream logs from a remote node",
		Options:        ffSubcommandOptions(),
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			manager.SetLogger(zap.NewNop())
			manager.DisableIPFSNetwork()

			// messenger
			messenger, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			stream, err := messenger.DevStreamLogs(ctx, &messengertypes.DevStreamLogs_Request{})
			if err != nil {
				return err
			}

			for {
				ret, err := stream.Recv()
				if err == io.EOF {
					return nil
				}
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				fmt.Println(ret.Line)
			}
		},
	}
}
