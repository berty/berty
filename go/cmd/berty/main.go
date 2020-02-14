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

	"berty.tech/berty/go/internal/banner"
	"berty.tech/berty/go/internal/grpcutil"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/pkg/bertydemo"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"moul.io/srand"
)

func main() {
	log.SetFlags(0)

	var (
		logger      *zap.Logger
		globalFlags = flag.NewFlagSet("berty", flag.ExitOnError)
		globalDebug = globalFlags.Bool("debug", false, "debug mode")

		bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight = bannerFlags.Bool("light", false, "light mode")

		clientProtocolFlags     = flag.NewFlagSet("protocol client", flag.ExitOnError)
		clientProtocolURN       = clientProtocolFlags.String("protocol-urn", ":memory:", "protocol sqlite URN")
		clientProtocolListeners = clientProtocolFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")

		clientDemoFlags     = flag.NewFlagSet("demo client", flag.ExitOnError)
		clientDemoDirectory = clientDemoFlags.String("d", ":memory:", "orbit db directory")
		clientDemoListeners = clientDemoFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
	)

	globalPreRun := func() error {
		rand.Seed(srand.Secure())
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

	mini := &ffcli.Command{
		Name:  "mini",
		Usage: "mini",
		Exec: func(args []string) error {
			miniMain(args)
			return nil
		},
	}

	daemon := &ffcli.Command{
		Name:    "daemon",
		Usage:   "berty daemon",
		FlagSet: clientProtocolFlags,
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

				api, node, err := ipfsutil.NewInMemoryCoreAPI(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer node.Close()

				// initialize new protocol client
				opts := bertyprotocol.Opts{
					IpfsCoreAPI: api,
					Logger:      logger.Named("bertyprotocol"),
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
				addrs := strings.Split(*clientProtocolListeners, ",")
				for _, addr := range addrs {
					maddr, err := parseAddr(addr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					l, err := grpcutil.Listen(maddr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					server := grpcutil.Server{grpcServer}

					workers.Add(func() error {
						logger.Info("serving", zap.String("maddr", maddr.String()))
						return server.Serve(l)
					}, func(error) {
						l.Close()
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

	demo := &ffcli.Command{
		Name:    "demo",
		Usage:   "berty demo",
		FlagSet: clientDemoFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			ctx := context.Background()

			// demo
			var demo *bertydemo.Client
			{
				var err error

				api, node, err := ipfsutil.NewInMemoryCoreAPI(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer node.Close()

				demo, err = bertydemo.New(&bertydemo.Opts{
					CoreAPI:          api,
					OrbitDBDirectory: *clientDemoDirectory,
				})
				if err != nil {
					return err
				}

				defer demo.Close()
			}

			// listeners for berty
			var workers run.Group
			{
				// setup grpc server
				grpcServer := grpc.NewServer()
				bertydemo.RegisterDemoServiceServer(grpcServer, demo)
				// setup listeners
				addrs := strings.Split(*clientDemoListeners, ",")
				for _, addr := range addrs {
					maddr, err := parseAddr(addr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					l, err := grpcutil.Listen(maddr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					server := grpcutil.Server{grpcServer}

					workers.Add(func() error {
						logger.Info("serving", zap.String("maddr", maddr.String()))
						return server.Serve(l)
					}, func(error) {
						l.Close()
					})
				}
			}

			return workers.Run()
		},
	}

	root := &ffcli.Command{
		Usage:       "berty [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, demo, banner, version, mini},
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
