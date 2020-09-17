package main

import (
	"context"
	"flag"
	"fmt"
	"time"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/peterbourgon/ff/v3/ffcli"
	"moul.io/godev"
)

func systemInfoCommand() *ffcli.Command {
	var (
		fs               = flag.NewFlagSet("info", flag.ExitOnError)
		refreshEveryFlag time.Duration
		anonimizeFlag    bool
	)
	manager.SetupLocalMessengerServerFlags(fs) // by default, start a new local messenger server,
	manager.SetupRemoteNodeFlags(fs)           // but allow to set a remote server instead
	fs.DurationVar(&refreshEveryFlag, "info.refresh", refreshEveryFlag, "refresh every DURATION (0: no refresh)")
	fs.BoolVar(&anonimizeFlag, "info.anonimize", false, "anonimize output for sharing")

	return &ffcli.Command{
		Name:       "info",
		ShortUsage: "berty [global flags] info [flags]",
		ShortHelp:  "display system info",
		FlagSet:    fs,
		Exec: func(ctx context.Context, args []string) error {
			// messenger client
			messenger, err := manager.GetMessengerClient()
			if err != nil {
				return err
			}

			for {
				ret, err := messenger.SystemInfo(ctx, &bertymessenger.SystemInfo_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if ret.Messenger.ProtocolInSameProcess {
					ret.Messenger.Process = nil
				}

				if anonimizeFlag {
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
				/// clear screen
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
