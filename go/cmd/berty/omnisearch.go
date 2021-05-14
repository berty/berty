package main

import (
	"context"
	"flag"
	"fmt"

	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/omnisearch"
)

func omnisearchCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty omnisearch", flag.ExitOnError)
		manager.Node.Preset = initutil.VolatilePreset
		manager.SetLogger(zap.NewNop())
		manager.SetupLocalMessengerServerFlags(fs) // we want to configure a local messenger server
		manager.SetupDefaultGRPCListenersFlags(fs)
		return fs, nil
	}

	return &ffcli.Command{
		Name:       "search",
		ShortUsage: "berty [global flags] search QUERY",
		ShortHelp:  "use omnisearch to find information about some things",
		LongHelp: `Currently parsers and engines available for omnisearch are :
- Berty invite parser (parse berty's group and one to one invites)
- Berty swiper engine (find peers (peer.AddrInfo) from their invites)

Example:
berty omnisearch https://berty.tech/id#key=CiDnVU4YlFPkjTbSggoZAWbFdAIsnuv5qoruQDyN_NB8rBIgfrT2x0wzMjiK4kBXnPYStGxW2Hssk8UyYfW8ITJbEFg&name=Example`,
		Options:        ffSubcommandOptions(),
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			rc, err := omnisearch.DefaultSearch(ctx, manager, args...)
			if err != nil {
				return err
			}

			for v := range rc {
				fmt.Printf("%s: %#+v\n", v.Finder.Name(), v.Object)
			}

			return nil
		},
	}
}
