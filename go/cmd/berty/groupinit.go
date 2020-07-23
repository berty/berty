package main

import (
	"context"
	"fmt"
	mrand "math/rand"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/peterbourgon/ff/v3/ffcli"
)

func groupinitCommand() *ffcli.Command {
	return &ffcli.Command{
		Name:      "groupinit",
		ShortHelp: "initialize a new multi-member group",
		Exec: func(ctx context.Context, args []string) error {
			g, _, err := bertyprotocol.NewGroupMultiMember()
			if err != nil {
				return err
			}

			name := fmt.Sprintf("random-group-%d", mrand.Int31()%65535)
			deepLink, _, err := bertymessenger.ShareableBertyGroupURL(g, name)
			if err != nil {
				return err
			}

			fmt.Print(deepLink)
			return nil
		},
	}
}
