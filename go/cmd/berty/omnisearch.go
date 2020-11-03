package main

import (
	"context"
	"flag"
	"fmt"

	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/omnisearch"
	omniEngineBerty "berty.tech/berty/v2/go/internal/omnisearch/engines/berty"
	omniParseBerty "berty.tech/berty/v2/go/internal/omnisearch/parsers/berty"
	omniProvManager "berty.tech/berty/v2/go/internal/omnisearch/providers/manager"
	omniProvRdvp "berty.tech/berty/v2/go/internal/omnisearch/providers/rdvp"
)

func omnisearchCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty omnisearch", flag.ExitOnError)
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
- Berty swiper engine (find peers (peer.AddrInfo) from their invites)`,
		Options:        []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			manager.Node.Preset = initutil.TemporaryPreset

			manager.SetLogger(zap.NewNop())

			var rdvpAddrs []string
			{
				i := len(config.Config.P2P.RDVP)
				rdvpAddrs = make([]string, i)
				for i > 0 {
					i--
					rdvpAddrs[i] = config.Config.P2P.RDVP[i].Maddr
				}
			}

			cor, err := omnisearch.NewCoordinator(ctx,
				omnisearch.CAddProvider(
					omnisearch.NewMirror(manager),
					omniProvManager.NewFromManager,
					omniProvRdvp.NewConstructorFromStr(rdvpAddrs...),
				),
				omnisearch.CAddParser(
					omniParseBerty.New(),
				),
				omnisearch.CAddEngine(
					omniEngineBerty.New,
				),
			)
			if err != nil {
				return err
			}

			for v := range cor.DoStr(ctx, args...) {
				fmt.Printf("%s: %#+v\n", v.Finder.Name(), v.Object)
			}

			return nil
		},
	}
}
