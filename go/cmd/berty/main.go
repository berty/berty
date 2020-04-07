package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	mrand "math/rand"
	"net"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"berty.tech/berty/v2/go/cmd/berty/mini"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertydemo"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/juju/fslock"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/multiformats/go-multiaddr"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	ipfs_cfg "github.com/ipfs/go-ipfs-config"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"moul.io/srand"
)

// Default ipfs bootstrap & rendezvous point server

const RendezVousServer = "/ip4/167.99.223.55/tcp/4040/p2p/QmTo3RS6Uc8aCS5Cxx8EBHkNCe4C7vKRanbMEboxkA92Cn"

var DefaultBootstrap = ipfs_cfg.DefaultBootstrapAddresses

func main() {
	log.SetFlags(0)

	var (
		logger          *zap.Logger
		globalFlags     = flag.NewFlagSet("berty", flag.ExitOnError)
		globalDebug     = globalFlags.Bool("debug", false, "debug mode")
		globalLogToFile = globalFlags.String("logfile", "", "if specified, will log everything in JSON into a file and nothing on stderr")

		bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight = bannerFlags.Bool("light", false, "light mode")

		clientProtocolFlags     = flag.NewFlagSet("protocol client", flag.ExitOnError)
		clientProtocolListeners = clientProtocolFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
		clientProtocolPath      = clientProtocolFlags.String("d", cacheleveldown.InMemoryDirectory, "datastore base directory")

		clientDemoFlags     = flag.NewFlagSet("demo client", flag.ExitOnError)
		clientDemoDirectory = clientDemoFlags.String("d", ":memory:", "orbit db directory")
		clientDemoListeners = clientDemoFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")

		miniClientDemoFlags      = flag.NewFlagSet("mini demo client", flag.ExitOnError)
		miniClientDemoGroup      = miniClientDemoFlags.String("g", "", "group to join, leave empty to create a new group")
		miniClientDemoPath       = miniClientDemoFlags.String("d", cacheleveldown.InMemoryDirectory, "datastore base directory")
		miniClientDemoPort       = miniClientDemoFlags.Uint("p", 0, "default IPFS listen port")
		miniClientDemoRemoteAddr = miniClientDemoFlags.String("r", "", "remote berty daemon")
	)

	globalPreRun := func() (err error) {
		mrand.Seed(srand.Secure())
		logger, err = newLogger(*globalDebug, *globalLogToFile)
		return err
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
		Name:    "mini",
		Usage:   "mini",
		FlagSet: miniClientDemoFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			rootDS, dsLock, err := getRootDatastore(miniClientDemoPath)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			if dsLock != nil {
				defer func() { _ = dsLock.Unlock() }()
			}
			defer rootDS.Close()

			remoteAddr := ""
			if miniClientDemoRemoteAddr != nil && *miniClientDemoRemoteAddr != "" {
				remoteAddr = *miniClientDemoRemoteAddr
			}

			mini.Main(&mini.Opts{
				RemoteAddr:            remoteAddr,
				GroupInvitation:       *miniClientDemoGroup,
				Port:                  *miniClientDemoPort,
				RootDS:                rootDS,
				Logger:                logger,
				Bootstrap:             DefaultBootstrap,
				RendezVousServerMAddr: RendezVousServer,
			})
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
			var protocol bertyprotocol.Service
			{

				mardv := multiaddr.StringCast(RendezVousServer)
				rdvpeer, err := peer.AddrInfoFromP2pAddr(mardv)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				routingOpts, crouting := ipfsutil.NewTinderRouting(rdvpeer.ID, false)
				ipfsOpts := &ipfsutil.IpfsOpts{
					Bootstrap: append(DefaultBootstrap, RendezVousServer),
					Routing:   routingOpts,
				}

				api, node, err := ipfsutil.NewInMemoryCoreAPI(ctx, ipfsOpts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer node.Close()

				go func() {
					monitorPeers(ctx, logger, node.PeerHost, rdvpeer.ID)
				}()

				routing := <-crouting
				defer routing.IpfsDHT.Close()

				// if err := node.PeerHost.Connect(ctx, *rdvpeer); err != nil {
				// 	return errcode.TODO.Wrap(fmt.Errorf("cannot dial rendez-vous point: %v", err))
				// }

				rootDS, dsLock, err := getRootDatastore(clientProtocolPath)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if dsLock != nil {
					defer func() { _ = dsLock.Unlock() }()
				}
				defer rootDS.Close()

				deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
				mk := bertyprotocol.NewMessageKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("messages")))

				// initialize new protocol client
				opts := bertyprotocol.Opts{
					IpfsCoreAPI:     api,
					Logger:          logger.Named("bertyprotocol"),
					RootContext:     ctx,
					RootDatastore:   rootDS,
					MessageKeystore: mk,
					DeviceKeystore:  bertyprotocol.NewDeviceKeystore(deviceDS),
					OrbitCache:      bertyprotocol.NewOrbitDatastoreCache(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("orbitdb"))),
				}
				protocol, err = bertyprotocol.New(opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				defer protocol.Close()
			}

			// listeners for berty
			var workers run.Group
			{
				// setup grpc server
				grpcLogger := logger.Named("grpc.protocol")
				// Define customfunc to handle panic
				panicHandler := func(p interface{}) (err error) {
					return status.Errorf(codes.Unknown, "panic recover: %v", p)
				}

				// Shared options for the logger, with a custom gRPC code to log level function.
				recoverOpts := []grpc_recovery.Option{
					grpc_recovery.WithRecoveryHandler(panicHandler),
				}

				zapOpts := []grpc_zap.Option{}

				// setup grpc with zap
				grpc_zap.ReplaceGrpcLoggerV2(grpcLogger)
				grpcServer := grpc.NewServer(
					grpc_middleware.WithUnaryServerChain(
						grpc_recovery.UnaryServerInterceptor(recoverOpts...),
						grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),

						grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
					),
					grpc_middleware.WithStreamServerChain(
						grpc_recovery.StreamServerInterceptor(recoverOpts...),
						grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
						grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
					),
				)

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

					server := grpcutil.Server{Server: grpcServer}

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
			var demo *bertydemo.Service
			{
				var err error

				mardv := multiaddr.StringCast(RendezVousServer)
				rdvpeer, err := peer.AddrInfoFromP2pAddr(mardv)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				routingOpts, crouting := ipfsutil.NewTinderRouting(rdvpeer.ID, false)
				ipfsOpts := &ipfsutil.IpfsOpts{
					Bootstrap: append(DefaultBootstrap, RendezVousServer),
					Routing:   routingOpts,
				}

				api, node, err := ipfsutil.NewInMemoryCoreAPI(ctx, ipfsOpts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer node.Close()

				routing := <-crouting
				defer routing.IpfsDHT.Close()

				demo, err = bertydemo.New(&bertydemo.Opts{
					Logger:           logger,
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

					server := grpcutil.Server{Server: grpcServer}

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

	groupinit := &ffcli.Command{
		Name:    "groupinit",
		Usage:   "berty groupinit - initialize a new multi member group",
		FlagSet: clientDemoFlags,
		Exec: func(args []string) error {
			g, _, err := bertyprotocol.NewGroupMultiMember()
			if err != nil {
				return err
			}

			gBytes, err := g.Marshal()
			if err != nil {
				return err
			}

			fmt.Print(base64.StdEncoding.EncodeToString(gBytes))
			return nil
		},
	}

	root := &ffcli.Command{
		Usage:       "berty [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, demo, banner, version, mini, groupinit},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}

func getRootDatastore(optPath *string) (datastore.Batching, *fslock.Lock, error) {
	var (
		baseDS datastore.Batching = datastore.NewMapDatastore()
		lock   *fslock.Lock
	)

	if optPath != nil && *optPath != cacheleveldown.InMemoryDirectory {
		basePath := path.Join(*optPath, "berty")
		_, err := os.Stat(basePath)
		if err != nil {
			if !os.IsNotExist(err) {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			if err := os.MkdirAll(basePath, 0700); err != nil {
				panic(err)
			}
		}

		lock = fslock.New(path.Join(*optPath, "lock"))
		err = lock.TryLock()
		if err != nil {
			return nil, nil, err
		}

		baseDS, err = badger.NewDatastore(basePath, nil)
		if err != nil {
			return nil, nil, err
		}

		baseDS = sync_ds.MutexWrap(baseDS)
	}

	return baseDS, lock, nil
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

func newLogger(debug bool, logfile string) (*zap.Logger, error) {
	bertyDebug := parseBoolFromEnv("BERTY_DEBUG") || debug
	libp2pDebug := parseBoolFromEnv("LIBP2P_DEBUG")
	// @NOTE(gfanton): since orbitdb use `zap.L()`, this will only
	// replace zap global logger with our logger
	orbitdbDebug := parseBoolFromEnv("ORBITDB_DEBUG")

	isDebugEnabled := bertyDebug || orbitdbDebug || libp2pDebug

	// setup zap config
	var config zap.Config
	if logfile != "" {
		config = zap.NewProductionConfig()
		config.OutputPaths = []string{logfile}
	} else {
		config = zap.NewDevelopmentConfig()
		config.DisableStacktrace = true
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	if isDebugEnabled {
		config.Level.SetLevel(zap.DebugLevel)
	} else {
		config.Level.SetLevel(zap.InfoLevel)
	}

	logger, err := config.Build()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if libp2pDebug {
		if err := ipfsutil.ConfigureLogger("*", logger, "debug"); err != nil {
			logger.Error("setup libp2p logger", zap.Error(err))
		}
	}

	if orbitdbDebug {
		zap.ReplaceGlobals(logger)
	}

	return logger, nil
}

func parseBoolFromEnv(key string) (b bool) {
	b, _ = strconv.ParseBool(os.Getenv(key))
	return
}

func monitorPeers(ctx context.Context, l *zap.Logger, h host.Host, peers ...peer.ID) error {
	currentStates := make([]network.Connectedness, len(peers))
	for i, p := range peers {
		state := h.Network().Connectedness(p)
		switch state {
		case network.Connected:
			l.Info("peer Connected", zap.String("ID", p.String()))
		case network.NotConnected:
			l.Info("peer NotConnected", zap.String("ID", p.String()))
		}

		currentStates[i] = state
	}

	for {
		time.Sleep(time.Second)

		for i, p := range peers {
			nextState := h.Network().Connectedness(p)
			if nextState != currentStates[i] {
				switch nextState {
				case network.Connected:
					l.Info("peer Connected", zap.String("ID", p.String()))
				case network.NotConnected:
					l.Info("peer NotConnected", zap.String("ID", p.String()))
				}

				currentStates[i] = nextState
			}
		}
	}
}
