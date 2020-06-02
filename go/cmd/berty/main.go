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
	"os/user"
	"path"
	"strings"
	"time"

	"berty.tech/berty/v2/go/cmd/berty/mini"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertychat"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	ipfs_log "github.com/ipfs/go-log"
	"github.com/juju/fslock"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"
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
	"moul.io/srand"
)

// DNS Resolve timeout
const ResolveTimeout = time.Second * 10

// Default ipfs bootstrap & rendezvous point server
var (
	DevRendezVousPoint = config.BertyDev.RendezVousPeer
	DefaultBootstrap   = config.BertyDev.Bootstrap
	DefaultMCBind      = config.BertyDev.DefaultMCBind
)

// nolint: gocyclo
func main() {
	log.SetFlags(0)

	var (
		globalDebug       bool
		globalLibp2pDebug bool
		globalOrbitDebug  bool
		globalLogToFile   string
		globalTracer      string

		bannerLight           bool
		bannerRandom          bool
		daemonListeners       string
		remoteDaemonAddr      string
		datastorePath         string
		rdvpMaddr             string
		rdvpForce             bool
		miniPort              uint
		shareInviteOnDev      bool
		shareInviteReset      bool
		shareInviteNoTerminal bool
		miniGroup             string
		displayName           string
	)

	var (
		logger *zap.Logger

		globalFlags      = flag.NewFlagSet("berty", flag.ExitOnError)
		bannerFlags      = flag.NewFlagSet("banner", flag.ExitOnError)
		devFlags         = flag.NewFlagSet("dev", flag.ExitOnError)
		daemonFlags      = flag.NewFlagSet("protocol client", flag.ExitOnError)
		miniFlags        = flag.NewFlagSet("mini demo client", flag.ExitOnError)
		shareInviteFlags = flag.NewFlagSet("dev share-invite", flag.ExitOnError)
	)

	globalFlags.BoolVar(&globalDebug, "debug", false, "berty debug mode")
	globalFlags.BoolVar(&globalLibp2pDebug, "debug-p2p", false, "libp2p debug mode")
	globalFlags.BoolVar(&globalOrbitDebug, "debug-odb", false, "orbitdb debug mode")
	globalFlags.StringVar(&globalLogToFile, "logfile", "", "if specified, will log everything in JSON into a file and nothing on stderr")
	globalFlags.StringVar(&globalTracer, "tracer", "", "specify \"stdout\" to output tracing on stdout or <hostname:port> to trace on jaeger")
	bannerFlags.BoolVar(&bannerLight, "light", false, "light mode")
	bannerFlags.BoolVar(&bannerRandom, "random", false, "pick a random quote")
	daemonFlags.StringVar(&daemonListeners, "l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
	daemonFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	daemonFlags.StringVar(&rdvpMaddr, "rdvp", DevRendezVousPoint, "rendezvous point maddr")
	daemonFlags.BoolVar(&rdvpForce, "force-rdvp", false, "force connect to rendezvous point")
	miniFlags.StringVar(&miniGroup, "g", "", "group to join, leave empty to create a new group")
	miniFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	miniFlags.UintVar(&miniPort, "p", 0, "default IPFS listen port")
	miniFlags.StringVar(&remoteDaemonAddr, "r", "", "remote berty daemon")
	miniFlags.StringVar(&rdvpMaddr, "rdvp", DevRendezVousPoint, "rendezvous point maddr")
	shareInviteFlags.BoolVar(&shareInviteOnDev, "dev-channel", false, "post qrcode on dev channel")
	shareInviteFlags.BoolVar(&shareInviteReset, "reset", false, "reset contact reference")
	shareInviteFlags.BoolVar(&shareInviteNoTerminal, "no-term", false, "do not print the QR code in terminal")
	shareInviteFlags.StringVar(&datastorePath, "d", cacheleveldown.InMemoryDirectory, "datastore base directory")
	shareInviteFlags.StringVar(&displayName, "display-name", safeDefaultDisplayName(), "display name")

	type cleanupFunc func()
	globalPreRun := func() cleanupFunc {
		mrand.Seed(srand.Secure())
		isDebugEnabled := globalDebug || globalOrbitDebug || globalLibp2pDebug
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

		if isDebugEnabled {
			config.Level.SetLevel(zap.DebugLevel)
		} else {
			config.Level.SetLevel(zap.InfoLevel)
		}

		var err error
		if logger, err = config.Build(); err != nil {
			log.Fatalf("unable to build log config: %s", err)
		}

		if globalLibp2pDebug {
			ipfs_log.SetDebugLogging()
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

	mini := &ffcli.Command{
		Name:      "mini",
		ShortHelp: "start a terminal-based mini berty client (not fully compatible with the app)",
		Usage:     "mini",
		FlagSet:   miniFlags,
		Exec: func(args []string) error {
			ctx := context.Background()
			cleanup := globalPreRun()
			defer cleanup()

			rootDS, dsLock, err := getRootDatastore(datastorePath)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if dsLock != nil {
				defer func() { _ = dsLock.Unlock() }()
			}
			defer rootDS.Close()

			rdvpeer, err := parseRdvpMaddr(ctx, rdvpMaddr, logger)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			l := zap.NewNop()
			if globalLogToFile != "" {
				l = logger
			}

			mini.Main(ctx, &mini.Opts{
				RemoteAddr:      remoteDaemonAddr,
				GroupInvitation: miniGroup,
				Port:            miniPort,
				RootDS:          rootDS,
				Logger:          l,
				Bootstrap:       DefaultBootstrap,
				RendezVousPeer:  rdvpeer,
			})
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
				api        ipfsutil.ExtendedCoreAPI
				routingOut *ipfsutil.RoutingOut
			)
			{
				var err error
				var bopts = ipfsutil.CoreAPIConfig{
					SwarmAddrs:        []string{DefaultMCBind},
					ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))),
				}

				bopts.BootstrapAddrs = DefaultBootstrap

				var crouting <-chan *ipfsutil.RoutingOut

				rdvpeer, err := parseRdvpMaddr(ctx, rdvpMaddr, logger)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if rdvpeer != nil {
					bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, rdvpMaddr)
					bopts.Routing, crouting = ipfsutil.NewTinderRouting(logger, rdvpeer, false)
				}

				var node *core.IpfsNode
				if api, node, err = ipfsutil.NewCoreAPI(ctx, &bopts); err != nil {
					return err
				}

				defer node.Close()

				if crouting != nil {
					routingOut = <-crouting
					defer routingOut.IpfsDHT.Close()

					if rdvpForce {
						go func() {
							// monitor rdv peer
							if err := monitorPeers(logger, node.PeerHost, rdvpeer.ID); err != nil {
								logger.Error("monitorPeers", zap.Error(err))
							}
						}()

						for {
							if err := node.PeerHost.Connect(ctx, *rdvpeer); err != nil {
								logger.Error("cannot dial rendez-vous point", zap.Error(err))
							} else {
								break
							}
							time.Sleep(time.Second)
						}
					}
				}
			}

			// listeners for berty
			var workers run.Group
			var grpcServer *grpc.Server
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
				grpcServer = grpc.NewServer(
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
				)

				// setup listeners
				addrs := strings.Split(daemonListeners, ",")
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
					TinderDriver:    routingOut,
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

				bertyprotocol.RegisterProtocolServiceServer(grpcServer, protocol)

				defer protocol.Close()
			}

			// chat
			{
				protocolClient, err := bertyprotocol.NewClient(protocol)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				chat := bertychat.New(protocolClient, &bertychat.Opts{Logger: logger.Named("chat")})
				bertychat.RegisterChatServiceServer(grpcServer, chat)
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

			gBytes, err := g.Marshal()
			if err != nil {
				return err
			}

			fmt.Print(base64.StdEncoding.EncodeToString(gBytes))
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
			chat := bertychat.New(protocolClient, &bertychat.Opts{Logger: logger.Named("chat")})
			ret, err := chat.InstanceShareableBertyID(ctx, &bertychat.InstanceShareableBertyID_Request{DisplayName: displayName})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if !shareInviteNoTerminal {
				qrterminal.Generate(ret.BertyID, qrterminal.L, os.Stdout) // FIXME: show deeplink
			}
			fmt.Printf("deeplink: %s\n", ret.DeepLink)
			fmt.Printf("html url: %s\n", ret.HTMLURL)
			if shareInviteOnDev {
				_, err = chat.DevShareInstanceBertyID(ctx, &bertychat.DevShareInstanceBertyID_Request{DisplayName: displayName})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
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
		Subcommands: []*ffcli.Command{daemon, mini, banner, version, dev},
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
				panic(err)
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

func monitorPeers(l *zap.Logger, h host.Host, peers ...peer.ID) error {
	currentStates := make([]network.Connectedness, len(peers))
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
