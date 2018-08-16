package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	reuse "github.com/libp2p/go-reuseport"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/berty/berty/core"
	nodeapi "github.com/berty/berty/core/api/node"
	p2papi "github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/network"
	"github.com/berty/berty/core/network/mock"
	"github.com/berty/berty/core/network/p2p"
	"github.com/berty/berty/core/node"
	"github.com/berty/berty/core/sql"
	"github.com/berty/berty/core/sql/sqlcipher"
)

type daemonOptions struct {
	bind         string
	hideBanner   bool
	sqlPath      string
	sqlKey       string
	dropDatabase bool
	initOnly     bool
	noP2P        bool
}

func newDaemonCommand() *cobra.Command {
	opts := &daemonOptions{}
	cmd := &cobra.Command{
		Use: "daemon",
		RunE: func(cmd *cobra.Command, args []string) error {
			return daemon(opts)
		},
	}
	flags := cmd.Flags()
	flags.BoolVar(&opts.dropDatabase, "drop-database", false, "drop database to force a reinitialization")
	flags.BoolVar(&opts.hideBanner, "hide-banner", false, "hide banner")
	flags.BoolVar(&opts.initOnly, "init-only", false, "stop after node initialization (useful for integration tests")
	flags.BoolVar(&opts.noP2P, "no-p2p", false, "Disable p2p Drvier")
	flags.StringVarP(&opts.bind, "bind", "", "0.0.0.0:1337", "gRPC listening address")
	flags.StringVarP(&opts.sqlKey, "sql-key", "", "s3cur3", "sqlcipher database encryption key")
	flags.StringVarP(&opts.sqlPath, "sql-path", "", "/tmp/berty.db", "sqlcipher database path")
	return cmd
}

func daemon(opts *daemonOptions) error {
	errChan := make(chan error)

	// initialize gRPC
	gs := grpc.NewServer()
	reflection.Register(gs)
	listener, err := reuse.Listen("tcp", opts.bind)
	if err != nil {
		return err
	}

	// initialize sql
	db, err := sqlcipher.Open(opts.sqlPath, []byte(opts.sqlKey))
	if err != nil {
		return errors.Wrap(err, "failed to open sqlcipher")
	}

	defer db.Close()
	if db, err = sql.Init(db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}

	if opts.dropDatabase {
		if err = sql.DropDatabase(db); err != nil {
			return errors.Wrap(err, "failed to drop database")
		}
	}

	if err = sql.Migrate(db); err != nil {
		return errors.Wrap(err, "failed to apply sql migrations")
	}

	var driver network.Driver
	if !opts.noP2P {
		var bootstrapConfig = &dht.BootstrapConfig{
			Queries: 5,
			Period:  time.Second,
			Timeout: 10 * time.Second,
		}
		driver, err = p2p.NewDriver(
			context.Background(),
			p2p.WithRandomIdentity(),
			p2p.WithDefaultMuxers(),
			p2p.WithDefaultPeerstore(),
			p2p.WithDefaultSecurity(),
			p2p.WithDefaultTransports(),
			p2p.WithDHTBoostrapConfig(bootstrapConfig),
			p2p.WithListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
			p2p.WithBootstrap(p2p.BootstrapIpfs...),
		)
		if err != nil {
			return err
		}
	}

	if driver == nil {
		driver = mock.NewEnqueuer()
	}

	// initialize node
	n, err := node.New(
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
		node.WithSQL(db),
		node.WithDevice(&entity.Device{Name: "bart"}), // FIXME: get device dynamically
		node.WithNetworkDriver(driver),                // FIXME: use a p2p driver instead
	)
	if err != nil {
		return errors.Wrap(err, "failed to initialize node")
	}

	if opts.initOnly {
		return nil
	}

	// start grpc server(s)
	go func() {
		errChan <- gs.Serve(listener)
	}()
	zap.L().Info("grpc server started",
		zap.String("user-id", n.UserID()),
		zap.String("bind", opts.bind),
		zap.Int("p2p-api", int(p2papi.Version)),
		zap.Int("node-api", int(nodeapi.Version)),
		zap.String("version", core.Version),
	)

	// start node
	go func() {
		errChan <- n.Start()
	}()

	// show banner
	if !opts.hideBanner {
		fmt.Println(banner)
	}

	// signal handling
	signalChan := make(chan os.Signal, 1)
	signal.Notify(
		signalChan,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
	)
	go func() {
		for {
			s := <-signalChan
			switch s {
			case syscall.SIGHUP: // kill -SIGHUP XXXX
				log.Println("sighup received")
			case syscall.SIGINT: // kill -SIGINT XXXX or Ctrl+c
				log.Println("sigint received")
				errChan <- nil
			case syscall.SIGTERM: // kill -SIGTERM XXXX (force stop)
				log.Println("sigterm received")
				errChan <- nil
			case syscall.SIGQUIT: // kill -SIGQUIT XXXX (stop and core dump)
				log.Println("sigquit received")
				errChan <- nil
			default:
				errChan <- fmt.Errorf("unknown signal received")
			}
		}
	}()

	// exiting on first goroutine triggering an error
	return <-errChan
}
