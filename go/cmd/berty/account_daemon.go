package main

import (
	"context"
	"flag"

	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/internal/grpcserver"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	account_svc "berty.tech/berty/v2/go/pkg/bertyaccount"
)

func accountDaemonCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty account-daemon", flag.ExitOnError)

		manager.SetupLoggingFlags(fs)
		manager.SetupDefaultGRPCListenersFlags(fs)
		manager.SetupDefaultGRPCAccountListenersFlags(fs)
		manager.SetupDatastoreFlags(fs)

		return fs, nil
	}

	return &ffcli.Command{
		Name:           "account-daemon",
		ShortUsage:     "berty [global flags] account-daemon [flags]",
		ShortHelp:      "start a full Berty instance (Berty Account)",
		Options:        ffSubcommandOptions(),
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			ctx, cancel := context.WithCancel(ctx)
			defer cancel()

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			workers := run.Group{}
			workers.Add(func() error {
				<-ctx.Done()
				return ctx.Err()
			}, func(error) {
				cancel()
			})

			server, serverMux, _, err := grpcserver.InitGRPCServer(&workers, &grpcserver.GRPCOpts{
				Logger:    logger,
				Listeners: manager.Node.GRPC.AccountListeners,
			})
			if err != nil {
				return err
			}

			serviceAccount, err := account_svc.NewService(&account_svc.Options{
				ServiceListeners: manager.Node.GRPC.Listeners,
				Logger:           logger,
				RootDirectory:    manager.Datastore.Dir,
			})
			if err != nil {
				return err
			}

			// register grpc service
			accounttypes.RegisterAccountServiceServer(server, serviceAccount)
			if err := accounttypes.RegisterAccountServiceHandlerServer(ctx, serverMux, serviceAccount); err != nil {
				return err
			}

			return workers.Run()
		},
	}
}
