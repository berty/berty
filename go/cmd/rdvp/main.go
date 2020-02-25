package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net"
	"os"
	"strings"
	"time"

	"berty.tech/berty/go/pkg/errcode"
	libp2p "github.com/libp2p/go-libp2p"
	libp2p_host "github.com/libp2p/go-libp2p-core/host"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
	libp2p_rp "github.com/libp2p/go-libp2p-rendezvous"
	libp2p_rpdb "github.com/libp2p/go-libp2p-rendezvous/db/sqlite"

	ma "github.com/multiformats/go-multiaddr"
	run "github.com/oklog/run"

	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func main() {
	log.SetFlags(0)

	var (
		process run.Group

		logger      *zap.Logger
		globalFlags = flag.NewFlagSet("rdvp", flag.ExitOnError)
		globalDebug = globalFlags.Bool("debug", false, "debug mode")

		serveFlags          = flag.NewFlagSet("serve", flag.ExitOnError)
		serveFlagsURN       = serveFlags.String("db", ":memory:", "rdvp sqlite URN")
		serveFlagsListeners = serveFlags.String("l", ":4040", "lists of listeners of (m)addrs separate by a comma")
		serveFlagsPK        = serveFlags.String("pk", "", "private key file path(not implemented)")
	)

	globalPreRun := func() error {
		rand.Seed(time.Now().UnixNano())
		if *globalDebug {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.DebugLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			logger.Debug("logger initialized in debug mode")
		} else {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.InfoLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
		}
		return nil
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// handle close signal
	execute, interupt := run.SignalHandler(ctx, os.Interrupt)
	process.Add(execute, interupt)

	serve := &ffcli.Command{
		Name:    "serve",
		Usage:   "serve -l <maddrs> -pk <private_key> -db <file>",
		FlagSet: serveFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			ctx, cancel := context.WithCancel(ctx)
			defer cancel()

			if *serveFlagsPK != "" {
				logger.Warn("custom pk not supported yet")
			}

			laddrs := strings.Split(*serveFlagsListeners, ",")
			listeners, err := parseAddrs(laddrs...)
			if err != nil {
				return err
			}

			// @TODO(gfanton): Support private key file
			host, err := libp2p.New(ctx, libp2p.ListenAddrs(listeners...))
			if err != nil {
				return err
			}

			logHostInfo(logger, host)
			defer host.Close()

			db, err := libp2p_rpdb.OpenDB(ctx, *serveFlagsURN)
			if err != nil {
				return err
			}

			defer db.Close()

			// @TODO(gfanton): override libp2p logger
			_ = libp2p_rp.NewRendezvousService(host, db)

			<-ctx.Done()
			return ctx.Err()
		},
	}

	root := &ffcli.Command{
		Usage:       "rdvp [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("RDVP")},
		Subcommands: []*ffcli.Command{serve},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	// add root command to process
	process.Add(func() error {
		return root.Run(os.Args[1:])
	}, func(error) {
		cancel()
	})

	// run process
	if err := process.Run(); err != nil && err != context.Canceled {
		log.Fatal(err)
	}

	os.Exit(0)
}

// helpers

func logHostInfo(l *zap.Logger, host libp2p_host.Host) {
	// print peer addrs
	fields := []zapcore.Field{zap.String("peerID", host.ID().String())}

	addrs := host.Addrs()
	pi := libp2p_peer.AddrInfo{
		ID:    host.ID(),
		Addrs: addrs,
	}
	if maddrs, err := libp2p_peer.AddrInfoToP2pAddrs(&pi); err == nil {
		for _, maddr := range maddrs {
			fields = append(fields, zap.Stringer("maddr", maddr))
		}
	}

	l.Info("host started", fields...)
}

func parseAddrs(addrs ...string) (maddrs []ma.Multiaddr, err error) {
	maddrs = make([]ma.Multiaddr, len(addrs))
	for i, addr := range addrs {
		maddrs[i], err = ma.NewMultiaddr(addr)

		if err != nil {
			// try to get a tcp multiaddr from host:port
			host, port, serr := net.SplitHostPort(addr)
			if serr != nil {
				return
			}

			if host == "" {
				host = "127.0.0.1"
			}

			addr = fmt.Sprintf("/ip4/%s/tcp/%s/", host, port)
			maddrs[i], err = ma.NewMultiaddr(addr)
		}
	}

	return
}
