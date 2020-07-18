package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	mrand "math/rand"
	"net"
	"os"
	"os/user"
	"path"
	"strings"
	"time"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	ipfs_log "github.com/ipfs/go-log/v2"
	"github.com/juju/fslock"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	peerstore "github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	qrterminal "github.com/mdp/qrterminal/v3"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	grpc_trace "go.opentelemetry.io/otel/plugin/grpctrace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"moul.io/godev"
	"moul.io/srand"
)

// DNS Resolve timeout
const ResolveTimeout = time.Second * 10

// Default ipfs bootstrap & rendezvous point server
var (
	DevRendezVousPoint = config.BertyDev.RendezVousPeer
	DefaultBootstrap   = config.BertyDev.Bootstrap
	DefaultSwarmAddrs  = config.BertyDev.DefaultSwarmAddrs
	DefaultAPIAddrs    = config.BertyDev.DefaultAPIAddrs
	APIConfig          = config.BertyDev.APIConfig
)

// nolint: gocyclo
func main() {
	log.SetFlags(0)

	var (
		globalDebug           bool
		globalLibp2pDebug     bool
		globalOrbitDebug      bool
		globalPOIDebug        bool
		globalLogFormat       string
		globalLogToFile       string
		globalTracer          string
		globalLocalDiscovery  bool
		bannerLight           bool
		bannerRandom          bool
		daemonListeners       string
		datastorePath         string
		rdvpMaddr             string
		rdvpForce             bool
		shareInviteOnDev      bool
		shareInviteReset      bool
		shareInviteNoTerminal bool
		displayName           string
		infoRefreshEvery      time.Duration
	)

	var (
		logger *zap.Logger

		globalFlags      = flag.NewFlagSet("berty", flag.ExitOnError)
		bannerFlags      = flag.NewFlagSet("banner", flag.ExitOnError)
		devFlags         = flag.NewFlagSet("dev", flag.ExitOnError)
		daemonFlags      = flag.NewFlagSet("protocol client", flag.ExitOnError)
		shareInviteFlags = flag.NewFlagSet("dev share-invite", flag.ExitOnError)
		systemInfoFlags  = flag.NewFlagSet("info", flag.ExitOnError)
	)

	globalFlags.BoolVar(&globalDebug, "debug", false, "berty debug mode")
	globalFlags.BoolVar(&globalLibp2pDebug, "debug-p2p", false, "libp2p debug mode")
	globalFlags.BoolVar(&globalOrbitDebug, "debug-odb", false, "orbitdb debug mode")
	globalFlags.BoolVar(&globalPOIDebug, "debug-poi", false, "peer-of-interest debug mode")
	globalFlags.StringVar(&globalLogToFile, "logfile", "", "if specified, will log everything in JSON into a file and nothing on stderr")
	globalFlags.StringVar(&globalLogFormat, "logformat", "", "if specified, will override default log format")
	globalFlags.StringVar(&globalTracer, "tracer", "", "specify \"stdout\" to output tracing on stdout or <hostname:port> to trace on jaeger")
	globalFlags.BoolVar(&globalLocalDiscovery, "localdiscovery", true, "local discovery")
	globalFlags.StringVar(&displayName, "display-name", safeDefaultDisplayName(), "display name")
	bannerFlags.BoolVar(&bannerLight, "light", false, "light mode")
	bannerFlags.BoolVar(&bannerRandom, "random", false, "pick a random quote")
	daemonFlags.StringVar(&daemonListeners, "l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
	daemonFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	daemonFlags.StringVar(&rdvpMaddr, "rdvp", DevRendezVousPoint, "rendezvous point maddr")
	daemonFlags.BoolVar(&rdvpForce, "force-rdvp", false, "force connect to rendezvous point")
	shareInviteFlags.BoolVar(&shareInviteOnDev, "dev-channel", false, "post qrcode on dev channel")
	shareInviteFlags.BoolVar(&shareInviteReset, "reset", false, "reset contact reference")
	shareInviteFlags.BoolVar(&shareInviteNoTerminal, "no-term", false, "do not print the QR code in terminal")
	shareInviteFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	systemInfoFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	systemInfoFlags.DurationVar(&infoRefreshEvery, "refresh", 0, "refresh every DURATION (0: no refresh)")

	type cleanupFunc func()
	globalPreRun := func() cleanupFunc {
		mrand.Seed(srand.Secure())
		isDebugEnabled := globalDebug || globalOrbitDebug || globalLibp2pDebug || globalPOIDebug
		flush := tracer.InitTracer(globalTracer, "berty")

		// setup zap config
		var config zap.Config
		if globalLogToFile != "" {
			config = zap.NewProductionConfig()
			config.OutputPaths = []string{globalLogToFile}
		} else {
			config = zap.NewDevelopmentConfig()
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		}

		if globalLogFormat != "" {
			switch strings.ToLower(globalLogFormat) {
			case "json":
				config.Encoding = "json"
			case "console":
				config.Encoding = "console"
				config.EncoderConfig.EncodeTime = zapcore.RFC3339TimeEncoder
				config.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
			case "color":
				config.Encoding = "console"
				config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
				config.EncoderConfig.EncodeDuration = zapcore.StringDurationEncoder
				config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			default:
				log.Fatalf("unknow log format: %s", globalLogFormat)
			}
		}

		if isDebugEnabled {
			config.Level.SetLevel(zap.DebugLevel)
		} else {
			config.Level.SetLevel(zap.InfoLevel)
		}

		var err error
		if logger, err = config.Build(); err != nil {
			log.Fatalf("unable to build log config: %s", err)
		}

		ipfs_log.SetupLogging(ipfs_log.Config{
			Stderr: false,
			Stdout: false,
		})
		ipfs_log.SetAllLoggers(ipfs_log.LevelFatal)
		if globalLibp2pDebug {
			pr := ipfs_log.NewPipeReader()
			// ipfs_log.SetLogLevel("pubsub", "debug")
			r := bufio.NewReader(pr)
			go func() {
				defer pr.Close()
				var err error
				for err != io.EOF {
					var line []byte
					if line, _, err = r.ReadLine(); err == nil {
						logger.Debug(fmt.Sprintf("%s", line))
					}
				}
			}()
		}

		if globalOrbitDebug {
			zap.ReplaceGlobals(logger)
		}

		return flush
	}

	banner := &ffcli.Command{
		Name:      "banner",
		Usage:     "banner",
		FlagSet:   bannerFlags,
		ShortHelp: "print the ascii Berty banner of the day",
		Exec: func(args []string) error {
			cleanup := globalPreRun()
			defer cleanup()

			quote := banner.QOTD()
			if bannerRandom {
				quote = banner.RandomQuote()
			}

			if bannerLight {
				fmt.Println(quote)
			} else {
				fmt.Println(banner.Say(quote.String()))
			}
			return nil
		},
	}

	version := &ffcli.Command{
		Name:      "version",
		Usage:     "version",
		ShortHelp: "print software version",
		Exec: func(args []string) error {
			fmt.Println("dev")
			return nil
		},
	}

	daemon := &ffcli.Command{
		Name:      "daemon",
		Usage:     "berty daemon",
		FlagSet:   daemonFlags,
		ShortHelp: "start a full Berty instance",
		Exec: func(args []string) error {
			ctx := context.Background()
			cleanup := globalPreRun()
			defer cleanup()

			var (
				node *core.IpfsNode
				api  ipfsutil.ExtendedCoreAPI
				ps   *pubsub.PubSub
				disc tinder.Driver
			)

			{
				rdvpeer, err := parseRdvpMaddr(ctx, rdvpMaddr, logger)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				// var err error
				var bopts = ipfsutil.CoreAPIConfig{
					SwarmAddrs:        DefaultSwarmAddrs,
					APIAddrs:          DefaultAPIAddrs,
					APIConfig:         APIConfig,
					DisableCorePubSub: true,
					ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))),
					HostConfig: func(h host.Host, _ routing.Routing) error {
						var err error

						h.Peerstore().AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
						// @FIXME(gfanton): use rand as argument
						rdvClient := tinder.NewRendezvousDiscovery(logger, h, rdvpeer.ID,
							rand.New(rand.NewSource(rand.Int63())))

						minBackoff, maxBackoff := time.Second, time.Minute
						rng := rand.New(rand.NewSource(rand.Int63()))
						disc, err = tinder.NewService(
							logger,
							rdvClient,
							discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
						)
						if err != nil {
							return err
						}

						ps, err = pubsub.NewGossipSub(ctx, h,
							pubsub.WithMessageSigning(true),
							pubsub.WithFloodPublish(true),
							pubsub.WithDiscovery(disc),
						)

						if err != nil {
							return err
						}

						return nil
					},
				}

				bopts.BootstrapAddrs = DefaultBootstrap

				if api, node, err = ipfsutil.NewCoreAPI(ctx, &bopts); err != nil {
					return err
				}

				defer node.Close()

				// drivers := []tinder.Driver{}
				// if rdvpeer != nil {
				// 	if rdvpeer != nil {
				// 		node.Peerstore.AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
				// 		// @FIXME(gfanton): use rand as argument
				// 		rdvClient := tinder.NewRendezvousDiscovery(logger, node.PeerHost, rdvpeer.ID, rand.New(rand.NewSource(rand.Int63())))
				// 		drivers = append(drivers, rdvClient)
				// 	}

				// 	// if localDiscovery {
				// 	localDiscovery := tinder.NewLocalDiscovery(logger, node.PeerHost, rand.New(rand.NewSource(rand.Int63())))
				// 	drivers = append(drivers, localDiscovery)
				// 	// }

				// 	bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, rdvpMaddr)
				// }

				node.Peerstore.AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
				// @FIXME(gfanton): use rand as argument
				rdvClient := tinder.NewRendezvousDiscovery(logger, node.PeerHost, rdvpeer.ID,
					rand.New(rand.NewSource(rand.Int63())))
				minBackoff, maxBackoff := time.Second*60, time.Hour
				rng := rand.New(rand.NewSource(rand.Int63()))
				disc, err := tinder.NewService(
					logger,
					rdvClient,
					discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
				)
				if err != nil {
					return err
				}

				psapi := ipfsutil.NewPubSubAPI(ctx, logger.Named("ps"), disc, ps)
				api = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(api, psapi)

				if globalPOIDebug {
					ipfsutil.EnableConnLogger(logger, node.PeerHost)
				}

				// construct http api endpoint
				ipfsutil.ServeHTTPApi(logger, node, "")

				// serve the embedded ipfs webui
				ipfsutil.ServeHTTPWebui(logger)
			}

			// listeners for berty
			var workers run.Group
			var grpcServer *grpc.Server
			var grpcServeMux *grpcgw.ServeMux
			{
				// setup grpc server
				grpcLogger := logger.Named("grpc")
				// Define customfunc to handle panic
				panicHandler := func(p interface{}) (err error) {
					return status.Errorf(codes.Unknown, "panic recover: %v", p)
				}

				// Shared options for the logger, with a custom gRPC code to log level function.
				recoverOpts := []grpc_recovery.Option{
					grpc_recovery.WithRecoveryHandler(panicHandler),
				}

				zapOpts := []grpc_zap.Option{}

				tr := tracer.New("grpc-server")
				// setup grpc with zap
				grpc_zap.ReplaceGrpcLoggerV2(grpcLogger)

				grpcOpts := []grpc.ServerOption{
					grpc_middleware.WithUnaryServerChain(
						grpc_recovery.UnaryServerInterceptor(recoverOpts...),
						grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
						grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
						grpc_trace.UnaryServerInterceptor(tr),
					),
					grpc_middleware.WithStreamServerChain(
						grpc_recovery.StreamServerInterceptor(recoverOpts...),
						grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
						grpc_trace.StreamServerInterceptor(tr),
						grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
					),
				}

				grpcServer = grpc.NewServer(grpcOpts...)
				grpcServeMux = grpcgw.NewServeMux()

				// setup listeners
				addrs := strings.Split(daemonListeners, ",")
				for _, addr := range addrs {
					maddr, err := parseAddr(addr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					l, err := grpcutil.Listen(maddr)
					if err != nil {
						fmt.Printf("ERROR: %s\n", err)
						return errcode.TODO.Wrap(err)
					}

					server := grpcutil.Server{
						Server:   grpcServer,
						ServeMux: grpcServeMux,
					}

					workers.Add(func() error {
						logger.Info("serving", zap.String("maddr", maddr.String()))
						return server.Serve(l)
					}, func(error) {
						l.Close()
					})
				}
			}

			// protocol
			var protocol bertyprotocol.Service
			{
				rootDS, dsLock, err := getRootDatastore(datastorePath)
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
					Host:            node.PeerHost,
					PubSub:          ps,
					TinderDriver:    disc,
					IpfsCoreAPI:     api,
					Logger:          logger.Named("protocol"),
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

				// register grpc service
				bertyprotocol.RegisterProtocolServiceServer(grpcServer, protocol)
				if err := bertyprotocol.RegisterProtocolServiceHandlerServer(ctx, grpcServeMux, protocol); err != nil {
					return errcode.TODO.Wrap(err)
				}
			}

			// messenger
			{
				protocolClient, err := bertyprotocol.NewClient(protocol)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				opts := bertymessenger.Opts{
					Logger:          logger.Named("messenger"),
					ProtocolService: protocol,
				}
				messenger := bertymessenger.New(protocolClient, &opts)

				// register grpc service
				bertymessenger.RegisterMessengerServiceServer(grpcServer, messenger)
				if err := bertymessenger.RegisterMessengerServiceHandlerServer(ctx, grpcServeMux, messenger); err != nil {
					return errcode.TODO.Wrap(err)
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

	groupinit := &ffcli.Command{
		Name:      "groupinit",
		ShortHelp: "initialize a new multi-member group",
		Exec: func(args []string) error {
			g, _, err := bertyprotocol.NewGroupMultiMember()
			if err != nil {
				return err
			}

			deepLink, _, err := bertymessenger.ShareableBertyGroupURL(g, fmt.Sprintf("random-group-%d", mrand.Int31()%65535))
			if err != nil {
				return err
			}

			fmt.Print(deepLink)
			return nil
		},
	}

	shareInvite := &ffcli.Command{
		Name:      "share-invite",
		ShortHelp: "share invite link to Discord dedicated channel",
		FlagSet:   shareInviteFlags,
		Exec: func(args []string) error {
			ctx := context.Background()
			cleanup := globalPreRun()
			defer cleanup()

			// protocol
			var protocol bertyprotocol.Service
			{
				rootDS, dsLock, err := getRootDatastore(datastorePath)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if dsLock != nil {
					defer func() { _ = dsLock.Unlock() }()
				}
				defer rootDS.Close()
				deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
				opts := bertyprotocol.Opts{
					Logger:         logger.Named("bertyprotocol"),
					RootContext:    ctx,
					RootDatastore:  rootDS,
					DeviceKeystore: bertyprotocol.NewDeviceKeystore(deviceDS),
				}
				protocol, err = bertyprotocol.New(opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer protocol.Close()
			}
			protocolClient, err := bertyprotocol.NewClient(protocol)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			messenger := bertymessenger.New(protocolClient, &bertymessenger.Opts{Logger: logger.Named("messenger"), ProtocolService: protocol})
			ret, err := messenger.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{DisplayName: displayName})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if !shareInviteNoTerminal {
				qrterminal.GenerateHalfBlock(ret.DeepLink, qrterminal.L, os.Stdout) // FIXME: show deeplink
			}
			fmt.Printf("deeplink: %s\n", ret.DeepLink)
			fmt.Printf("html url: %s\n", ret.HTMLURL)
			if shareInviteOnDev {
				_, err = messenger.DevShareInstanceBertyID(ctx, &bertymessenger.DevShareInstanceBertyID_Request{DisplayName: displayName})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
			}
			return nil
		},
	}

	systemInfo := &ffcli.Command{
		Name:      "info",
		ShortHelp: "display system info",
		FlagSet:   systemInfoFlags,
		Exec: func(args []string) error {
			ctx := context.Background()
			cleanup := globalPreRun()
			defer cleanup()

			// protocol
			var protocol bertyprotocol.Service
			{
				rootDS, dsLock, err := getRootDatastore(datastorePath)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if dsLock != nil {
					defer func() { _ = dsLock.Unlock() }()
				}
				defer rootDS.Close()
				deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
				opts := bertyprotocol.Opts{
					Logger:         logger.Named("bertyprotocol"),
					RootContext:    ctx,
					RootDatastore:  rootDS,
					DeviceKeystore: bertyprotocol.NewDeviceKeystore(deviceDS),
				}
				protocol, err = bertyprotocol.New(opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer protocol.Close()
			}
			protocolClient, err := bertyprotocol.NewClient(protocol)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			messenger := bertymessenger.New(protocolClient, &bertymessenger.Opts{Logger: logger.Named("messenger"), ProtocolService: protocol})

			for {
				ret, err := messenger.SystemInfo(ctx, &bertymessenger.SystemInfo_Request{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if infoRefreshEvery == 0 {
					fmt.Println(godev.PrettyJSONPB(ret))
					break
				}
				/// clear screen
				print("\033[H\033[2J")
				fmt.Println(godev.PrettyJSONPB(ret))
				time.Sleep(infoRefreshEvery)
			}

			return nil
		},
	}

	dev := &ffcli.Command{
		Name:        "dev",
		Usage:       "berty [global flags] dev <subcommand> [flags] [args...]",
		ShortHelp:   "developer helpers and tools",
		FlagSet:     devFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{groupinit, shareInvite},
		Exec: func([]string) error {
			devFlags.Usage()
			return flag.ErrHelp
		},
	}

	root := &ffcli.Command{
		Usage:       "berty [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, banner, version, systemInfo, dev},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}

func getRootDatastore(optPath string) (datastore.Batching, *fslock.Lock, error) {
	var (
		baseDS datastore.Batching = sync_ds.MutexWrap(datastore.NewMapDatastore())
		lock   *fslock.Lock
	)

	if optPath != "" && optPath != cacheleveldown.InMemoryDirectory {
		basePath := path.Join(optPath, "berty")
		_, err := os.Stat(basePath)
		if err != nil {
			if !os.IsNotExist(err) {
				return nil, nil, errcode.TODO.Wrap(err)
			}
			if err := os.MkdirAll(basePath, 0700); err != nil {
				return nil, nil, errcode.TODO.Wrap(err)
			}
		}

		lock = fslock.New(path.Join(optPath, "lock"))
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

func parseRdvpMaddr(ctx context.Context, rdvpMaddr string, logger *zap.Logger) (*peer.AddrInfo, error) {
	if rdvpMaddr == "" {
		logger.Debug("no rendezvous peer set")
		return nil, nil
	}

	resoveCtx, cancel := context.WithTimeout(ctx, ResolveTimeout)
	defer cancel()

	rdvpeer, err := ipfsutil.ParseAndResolveIpfsAddr(resoveCtx, rdvpMaddr)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	fds := make([]zapcore.Field, len(rdvpeer.Addrs))
	for i, maddr := range rdvpeer.Addrs {
		key := fmt.Sprintf("#%d", i)
		fds[i] = zap.String(key, maddr.String())
	}
	logger.Debug("rdvp peer resolved addrs", fds...)
	return rdvpeer, nil
}

func safeDefaultDisplayName() string {
	var name string
	current, err := user.Current()
	if err == nil {
		name = current.Username
	}
	if name == "" {
		name = os.Getenv("USER")
	}
	if name == "" {
		name = "Anonymous4242"
	}
	return fmt.Sprintf("%s (cli)", name)
}
