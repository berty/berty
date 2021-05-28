package main

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"
	"os"

	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func groupinitCommand() *ffcli.Command {
	// FIXME: share on discord
	// FIXME: print berty.tech URL
	var (
		noQRFlag   bool
		passphrase string
	)
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty groupinit", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		fs.BoolVar(&noQRFlag, "no-qr", noQRFlag, "do not print the QR code in terminal")
		fs.StringVar(&passphrase, "passphrase", passphrase, "optional encryption passphrase")
		// manager.Session.Kind = "cmd.berty.groupinit"
		manager.SetupLoggingFlags(fs) // also available at root level
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "groupinit",
		ShortHelp:      "initialize a new multi-member group",
		ShortUsage:     "berty groupinit",
		FlagSetBuilder: fsBuilder,
		Options:        ffSubcommandOptions(),
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			g, _, err := bertyprotocol.NewGroupMultiMember()
			if err != nil {
				return err
			}

			name := fmt.Sprintf("random-group-%d", mrand.Int31()%65535) // nolint:gosec
			group := &messengertypes.BertyGroup{
				Group:       g,
				DisplayName: name,
			}
			link := group.GetBertyLink()

			if passphrase != "" {
				link, err = bertylinks.EncryptLink(link, []byte(passphrase))
				if err != nil {
					return err
				}
			}

			internal, web, err := bertylinks.MarshalLink(link)
			if err != nil {
				return err
			}

			fmt.Println(web)
			if !noQRFlag {
				fmt.Fprintln(os.Stderr)
				fmt.Fprintln(os.Stderr, internal)
				qrterminal.GenerateHalfBlock(internal, qrterminal.L, os.Stderr)
			}

			return nil
		},
	}
}
