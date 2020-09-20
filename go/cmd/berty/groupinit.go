package main

import (
	"context"
	"flag"
	"fmt"
	mrand "math/rand"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

func groupinitCommand() *ffcli.Command {
	// FIXME: share on discord
	// FIXME: print QR
	// FIXME: print berty.tech URL
	return &ffcli.Command{
		Name:       "groupinit",
		ShortHelp:  "initialize a new multi-member group",
		ShortUsage: "berty groupinit",
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			g, _, err := bertyprotocol.NewGroupMultiMember()
			if err != nil {
				return err
			}

			name := fmt.Sprintf("random-group-%d", mrand.Int31()%65535) // nolint:gosec
			deepLink, _, err := bertymessenger.ShareableBertyGroupURL(g, name)
			if err != nil {
				return err
			}

			fmt.Println(deepLink)
			return nil
		},
	}
}
