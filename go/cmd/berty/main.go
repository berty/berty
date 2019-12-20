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

	"berty.tech/go/internal/banner"
	"berty.tech/go/internal/grpcutil"
	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
)

func main() {
	log.SetFlags(0)

	var (
		logger            *zap.Logger
		globalFlags       = flag.NewFlagSet("berty", flag.ExitOnError)
		globalDebug       = globalFlags.Bool("debug", false, "debug mode")
		bannerFlags       = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight       = bannerFlags.Bool("light", false, "light mode")
		clientFlags       = flag.NewFlagSet("client", flag.ExitOnError)
		clientProtocolURN = clientFlags.String("protocol-urn", ":memory:", "protocol sqlite URN")
		clientListeners   = clientFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
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

	banner := &ffcli.Command{
		Name:    "banner",
		Usage:   "banner",
		FlagSet: bannerFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}
			if *bannerLight {
				fmt.Println(banner.QOTD())
			} else {
				fmt.Println(banner.OfTheDay())
			}
			return nil
		},
	}

	version := &ffcli.Command{
		Name:  "version",
		Usage: "version",
		Exec: func(args []string) error {
			fmt.Println("dev")
			return nil
		},
	}

	daemon := &ffcli.Command{
		Name:    "daemon",
		Usage:   "daemon",
		FlagSet: clientFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			ctx := context.Background()

			// protocol
			var protocol bertyprotocol.Client
			{
				// initialize sqlite3 gorm database
				db, err := gorm.Open("sqlite3", *clientProtocolURN)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer db.Close()

				// initialize new protocol client
				opts := bertyprotocol.Opts{
					Logger: logger.Named("bertyprotocol"),
				}
				protocol, err = bertyprotocol.New(db, opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				defer protocol.Close()
			}

			// listeners for berty
			var workers run.Group
			{
				// setup grpc server
				grpcServer := grpc.NewServer()
				bertyprotocol.RegisterProtocolServiceServer(grpcServer, protocol)

				// setup listeners
				addrs := strings.Split(*clientListeners, ",")
				for _, addr := range addrs {
					maddr, err := parseAddr(addr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					wgrpc, err := grpcutil.NewWrappedServer(maddr, grpcServer)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					workers.Add(func() error {
						logger.Info("serving", zap.String("addr", maddr.String()))
						return wgrpc.ListenAndServe()
					}, func(error) {
						wgrpc.Close()
					})
				}
			}

			info, err := protocol.InstanceGetConfiguration(ctx, nil)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			logger.Info("client initialized", zap.String("peer-id", info.PeerID), zap.Strings("listeners", info.Listeners))
			return workers.Run()
		},
	}

	root := &ffcli.Command{
		Usage:       "berty [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, banner, version},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}

func parseAddr(addr string) (maddr ma.Multiaddr, err error) {
	maddr, err = ma.NewMultiaddr(addr)
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
		maddr, err = ma.NewMultiaddr(addr)
	}

	return
}
