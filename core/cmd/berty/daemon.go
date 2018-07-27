package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	reuse "github.com/libp2p/go-reuseport"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/berty/berty/core/node"
	"github.com/berty/berty/core/sql"
	"github.com/berty/berty/core/sql/sqlcipher"
)

type daemonOptions struct {
	bind       string
	hideBanner bool
	sqlPath    string
	sqlKey     string
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
	flags.StringVarP(&opts.bind, "bind", "", "0.0.0.0:1337", "gRPC listening address")
	flags.BoolVar(&opts.hideBanner, "hide-banner", false, "hide banner")
	flags.StringVarP(&opts.sqlPath, "sql-path", "", "/tmp/berty.db", "sqlcipher database path")
	flags.StringVarP(&opts.sqlKey, "sql-key", "", "s3cur3", "sqlcipher database encryption key")
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

	// initialize node
	n := node.New(
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
		node.WithSQL(db),
	)

	// start grpc server(s)
	go func() {
		errChan <- gs.Serve(listener)
	}()
	if !opts.hideBanner {
		fmt.Println(banner)
	}
	log.Printf("listening on %s", opts.bind)

	// start node
	go func() {
		errChan <- n.Start()
	}()

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
