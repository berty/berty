package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/mdp/qrterminal/v3"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func daemonCommand() *ffcli.Command {
	var (
		noQRFlag         = false
		noBannerFlag     = false
		noSystemInfoFlag = false
		passphraseFlag   = ""
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty daemon", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.Session.Kind = "cli.daemon"
		manager.SetupLoggingFlags(fs)              // also available at root level
		manager.SetupLocalMessengerServerFlags(fs) // we want to configure a local messenger server
		manager.SetupDefaultGRPCListenersFlags(fs)
		manager.SetupMetricsFlags(fs)
		manager.SetupInitTimeout(fs)
		fs.StringVar(&passphraseFlag, "passphrase", passphraseFlag, "optional sharing-link encryption passphrase")
		fs.BoolVar(&noQRFlag, "no-qr", noQRFlag, "do not print the QR code in terminal on startup")
		fs.BoolVar(&noBannerFlag, "no-banner", noQRFlag, "do not print the Berty banner on startup")
		fs.BoolVar(&noSystemInfoFlag, "no-system-info", noQRFlag, "do not print system info on startup")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "daemon",
		ShortUsage:     "berty [global flags] daemon [flags]",
		ShortHelp:      "start a full Berty instance (Berty Protocol + Berty Messenger)",
		Options:        ffSubcommandOptions(),
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			// since this command is daemon, we want to be sure to run a local daemon with protocol and messenger
			{
				_, err := manager.GetLocalProtocolServer()
				if err != nil {
					return err
				}
				_, err = manager.GetLocalMessengerServer()
				if err != nil {
					return err
				}
			}

			// connect to the local client
			{
				protocolClient, err := manager.GetProtocolClient()
				if err != nil {
					return err
				}
				info, err := protocolClient.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				logger.Named("main").Info("daemon initialized", logutil.PrivateString("peer-id", info.PeerID), logutil.PrivateStrings("listeners", info.Listeners))
			}

			// display startup info
			var printLock sync.Mutex
			if !noBannerFlag {
				time.AfterFunc(time.Second, func() {
					printLock.Lock()
					fmt.Fprintln(os.Stderr, banner.OfTheDay())
					printLock.Unlock()
				})
			}
			if !noQRFlag {
				messenger, err := manager.GetMessengerClient()
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				ret, err := messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{
					DisplayName: manager.Node.Messenger.DisplayName,
					Passphrase:  []byte(passphraseFlag),
				})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				time.AfterFunc(time.Second, func() {
					printLock.Lock()
					qrterminal.GenerateHalfBlock(ret.InternalURL, qrterminal.L, os.Stderr)
					// fmt.Fprintln(os.Stderr, ret.InternalURL)
					fmt.Fprintln(os.Stderr, ret.WebURL)
					printLock.Unlock()
				})
			}
			if !noSystemInfoFlag {
				messenger, err := manager.GetMessengerClient()
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				ret, err := messenger.SystemInfo(ctx, &messengertypes.SystemInfo_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				time.AfterFunc(time.Second, func() {
					printLock.Lock()
					fmt.Fprintf(os.Stderr, "  Berty: %-30s  Go: %-10s\n", ret.Protocol.Process.Version, ret.Protocol.Process.GoVersion)
					fmt.Fprintf(os.Stderr, "  PID: %-12d  Arch: %-12s  OS: %-10s\n", ret.Protocol.Process.PID, ret.Protocol.Process.Arch, ret.Protocol.Process.OperatingSystem)
					fmt.Fprintf(os.Stderr, "  P2P peers: %-26d  Hostname: %-30s\n", ret.Protocol.P2P.ConnectedPeers, ret.Protocol.Process.HostName)
					fmt.Fprintf(os.Stderr, "  Accounts=%-2d Contacts=%-2d Convs=%-2d Members=%-2d Devices=%-2d\n", ret.Messenger.DB.Accounts, ret.Messenger.DB.Contacts, ret.Messenger.DB.Conversations, ret.Messenger.DB.Members, ret.Messenger.DB.Devices)
					fmt.Fprintf(os.Stderr, "  Work dir: %-50s\n", ret.Protocol.Process.WorkingDir)
					printLock.Unlock()
				})
			}

			return manager.RunWorkers()
		},
	}
}
