package main

import (
	"context"
	"flag"
	"fmt"

	ff "github.com/peterbourgon/ff/v3"
	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

func replicationServerCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty repl-server", flag.ExitOnError)
		manager.SetupLoggingFlags(fs) // also available at root level
		manager.SetupProtocolAuth(fs)
		manager.SetupLocalProtocolServerFlags(fs)
		manager.SetupDefaultGRPCListenersFlags(fs)
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "repl-server",
		ShortHelp:      "replication server",
		ShortUsage:     "berty [global flags] repl-server [flags]",
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Options:        []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			var err error

			if manager.Node.Protocol.AuthSecret == "" {
				return fmt.Errorf("node.auth-secret cannot be empty")
			}

			if manager.Node.Protocol.AuthPublicKey == "" {
				return fmt.Errorf("node.auth-pk cannot be empty")
			}

			server, mux, err := manager.GetGRPCServer()
			if err != nil {
				return err
			}

			logger, err := manager.GetLogger()
			if err != nil {
				return err
			}

			rootDS, err := manager.GetRootDatastore()
			if err != nil {
				return err
			}

			odb, err := manager.GetOrbitDB()
			if err != nil {
				return err
			}

			replicationService, err := bertyprotocol.NewReplicationService(ctx, rootDS, odb, logger)
			if err != nil {
				return err
			}

			bertyprotocol.RegisterReplicationServiceServer(server, replicationService)
			if err := bertyprotocol.RegisterReplicationServiceHandlerServer(ctx, mux, replicationService); err != nil {
				return err
			}

			return manager.RunWorkers()
		},
	}
}
