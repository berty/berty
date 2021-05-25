package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/godev"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func systemInfoCommand() *ffcli.Command {
	var (
		refreshEveryFlag time.Duration
		anonymizeFlag    bool
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("info", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.Session.Kind = "cli.info"
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupLocalMessengerServerFlags(fs) // by default, start a new local messenger server,
		manager.SetupRemoteNodeFlags(fs)           // but allow to set a remote server instead
		fs.DurationVar(&refreshEveryFlag, "info.refresh", refreshEveryFlag, "refresh every DURATION (0: no refresh)")
		fs.BoolVar(&anonymizeFlag, "info.anonymize", false, "anonymize output for sharing")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "info",
		ShortUsage:     "berty [global flags] info [flags]",
		ShortHelp:      "display system info",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			// messenger client
			messenger, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			for {
				ret, err := messenger.SystemInfo(ctx, &messengertypes.SystemInfo_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if ret.Messenger.ProtocolInSameProcess {
					ret.Messenger.Process = nil
				}

				if anonymizeFlag {
					if ret.Messenger != nil && ret.Messenger.Process != nil {
						redactStringPtr(&ret.Messenger.Process.HostName)
						redactStringPtr(&ret.Messenger.Process.WorkingDir)
					}
					if ret.Protocol != nil && ret.Protocol.Process != nil {
						redactStringPtr(&ret.Protocol.Process.HostName)
						redactStringPtr(&ret.Protocol.Process.WorkingDir)
					}
				}

				if refreshEveryFlag == 0 {
					fmt.Println(godev.PrettyJSONPB(ret))
					break
				}

				// clear screen
				print("\033[H\033[2J")
				fmt.Println(godev.PrettyJSONPB(ret))
				time.Sleep(refreshEveryFlag)
			}

			return nil
		},
	}
}

func redactStringPtr(ptr *string) {
	if ptr != nil && *ptr != "" {
		*ptr = "REDACTED"
	}
}
