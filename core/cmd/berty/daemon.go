package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	reuse "github.com/libp2p/go-reuseport"
	"github.com/spf13/cobra"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/berty/berty/core/node"
)

type daemonOptions struct {
	bind       string
	hideBanner bool
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
	return cmd
}

func daemon(opts *daemonOptions) error {
	// initialize dependencies
	gs := grpc.NewServer()
	reflection.Register(gs)
	listener, err := reuse.Listen("tcp", opts.bind)
	if err != nil {
		return err
	}

	// initialize nodes
	n := node.New(
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
	)
	_ = n

	// start grpc server(s)
	go gs.Serve(listener)
	if !opts.hideBanner {
		fmt.Println(banner)
	}
	log.Printf("listening on %s", opts.bind)

	// signal handling
	signal_chan := make(chan os.Signal, 1)
	signal.Notify(signal_chan,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT)

	exit_chan := make(chan int)
	go func() {
		for {
			s := <-signal_chan
			switch s {
			// kill -SIGHUP XXXX
			case syscall.SIGHUP:
				fmt.Println("hungup")

			// kill -SIGINT XXXX or Ctrl+c
			case syscall.SIGINT:
				exit_chan <- 0

			// kill -SIGTERM XXXX
			case syscall.SIGTERM:
				fmt.Println("force stop")
				exit_chan <- 0

			// kill -SIGQUIT XXXX
			case syscall.SIGQUIT:
				fmt.Println("stop and core dump")
				exit_chan <- 0

			default:
				fmt.Println("Unknown signal.")
				exit_chan <- 1
			}
		}
	}()

	code := <-exit_chan
	if code != 0 {
		os.Exit(code)
	}
	return nil
}
