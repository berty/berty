package main

import (
	"context"
	"flag"
	"fmt"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/authtypes"
	"berty.tech/berty/v2/go/pkg/bertyreplication"
	"berty.tech/berty/v2/go/pkg/replicationtypes"
)

func replicationServerCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty repl-server", flag.ExitOnError)
		fs.String("config", "", "config file (optional)")
		manager.Session.Kind = "cli.replication"
		manager.SetupLoggingFlags(fs) // also available at root level
		manager.SetupProtocolAuth(fs)
		manager.SetupLocalProtocolServerFlags(fs)
		manager.SetupDefaultGRPCListenersFlags(fs)

		// set serviceid for needed by push server
		manager.Node.Protocol.ServiceID = authtypes.ServiceReplicationID
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "repl-server",
		ShortHelp:      "replication server",
		ShortUsage:     "berty [global flags] repl-server [flags]",
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Options:        ffSubcommandOptions(),
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			if manager.Node.Protocol.AuthSecret == "" {
				return fmt.Errorf("node.auth-secret cannot be empty")
			}

			if manager.Node.Protocol.AuthPublicKey == "" {
				return fmt.Errorf("node.auth-pk cannot be empty")
			}

			var err error
			server, mux, err := manager.GetGRPCServer()
			if err != nil {
				return err
			}

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			db, err := manager.GetReplicationDB()
			if err != nil {
				return err
			}

			odb, err := manager.GetOrbitDB()
			if err != nil {
				return err
			}

			replicationService, err := bertyreplication.NewReplicationService(ctx, db, odb, logger)
			if err != nil {
				return err
			}

			replicationtypes.RegisterReplicationServiceServer(server, replicationService)
			if err := replicationtypes.RegisterReplicationServiceHandlerServer(ctx, mux, replicationService); err != nil {
				return err
			}

			return manager.RunWorkers()
		},
	}
}
