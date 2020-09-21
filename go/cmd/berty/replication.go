package main

import (
	"context"
	"flag"

	"github.com/peterbourgon/ff/v3/ffcli"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

func replicationServerCommand() *ffcli.Command {
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty share-invite", flag.ExitOnError)
		manager.SetupLocalProtocolServerFlags(fs)
		manager.SetupDefaultGRPCListenersFlags(fs)
		// fs.StringVar(&pkStr, "pk", pkStr, "auth token sig pk")
		// fs.StringVar(&secretStr, "secret", secretStr, "auth tokens secret")
		return fs, nil
	}

	return &ffcli.Command{
		Name:           "repl-server",
		ShortHelp:      "replication server",
		ShortUsage:     "berty [global flags] repl-server [flags]",
		FlagSetBuilder: fsBuilder,
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			var err error

			// if secret, err = base64.RawStdEncoding.DecodeString(secretStr); err != nil {
			// 	return err
			// }
			//
			// if pk, err = base64.RawStdEncoding.DecodeString(pkStr); err != nil {
			// 	return err
			// }
			//
			// if len(pk) != ed25519.PublicKeySize {
			// 	return fmt.Errorf("invalid pk size")
			// }
			// man, err := bertyprotocol.NewAuthTokenVerifier(secret, pk)
			// if err != nil {
			//     return err
			// }
			// TODO: add auth interceptor
			// 	// grpc.UnaryInterceptor(grpc_auth.UnaryServerInterceptor(man.GRPCAuthInterceptor(bertyprotocol.ServiceReplicationID))),

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
