package main

import (
	"context"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"log"
	mrand "math/rand"
	"net"
	"os"
	"path"
	"strings"
	"time"

	"berty.tech/berty/v2/go/cmd/berty/mini"
	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	iface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/juju/fslock"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"

	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	libp2p "github.com/libp2p/go-libp2p"

	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	ipfs_log "github.com/ipfs/go-log"

	ma "github.com/multiformats/go-multiaddr"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"moul.io/srand"
)

// DNS Resolve timeout
const ResolveTimeout = time.Second * 10

// Default ipfs bootstrap & rendezvous point server
var DevRendezVousPoint = config.BertyDev.RendezVousPeer
var DefaultBootstrap = config.BertyDev.Bootstrap
var DefaultMCBind = config.BertyDev.DefaultMCBind

func main() {
	log.SetFlags(0)

	var (
		logger            *zap.Logger
		globalFlags       = flag.NewFlagSet("berty", flag.ExitOnError)
		globalDebug       = globalFlags.Bool("debug", false, "berty debug mode")
		globalLibp2pDebug = globalFlags.Bool("debug-p2p", false, "libp2p debug mode")
		globalOrbitDebug  = globalFlags.Bool("debug-odb", false, "orbitdb debug mode")
		globalLogToFile   = globalFlags.String("logfile", "", "if specified, will log everything in JSON into a file and nothing on stderr")
		globalTracer      = globalFlags.String("tracer", "", "specify \"stdout\" to output tracing on stdout or <hostname:port> to trace on jaeger")

		bannerFlags = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight = bannerFlags.Bool("light", false, "light mode")

		clientProtocolFlags     = flag.NewFlagSet("protocol client", flag.ExitOnError)
		clientProtocolListeners = clientProtocolFlags.String("l", "/ip4/127.0.0.1/tcp/9091/grpc", "client listeners")
		clientProtocolPath      = clientProtocolFlags.String("d", cacheleveldown.InMemoryDirectory, "datastore base directory")
		clientProtocolRDVP      = clientProtocolFlags.String("rdvp", DevRendezVousPoint, "rendezvous point maddr")
		clientProtocolRDVPFroce = clientProtocolFlags.Bool("force-rdvp", false, "force connect to rendezvous point")

		miniClientDemoFlags      = flag.NewFlagSet("mini demo client", flag.ExitOnError)
		miniClientDemoGroup      = miniClientDemoFlags.String("g", "", "group to join, leave empty to create a new group")
		miniClientDemoPath       = miniClientDemoFlags.String("d", cacheleveldown.InMemoryDirectory, "datastore base directory")
		miniClientDemoPort       = miniClientDemoFlags.Uint("p", 0, "default IPFS listen port")
		miniClientDemoRemoteAddr = miniClientDemoFlags.String("r", "", "remote berty daemon")
		miniClientDemoRDVP       = miniClientDemoFlags.String("rdvp", DevRendezVousPoint, "rendezvous point maddr")
	)

	globalPreRun := func() error {
		mrand.Seed(srand.Secure())
		isDebugEnabled := *globalDebug || *globalOrbitDebug || *globalLibp2pDebug

		// setup zap config
		var config zap.Config
		if *globalLogToFile != "" {
			config = zap.NewProductionConfig()
			config.OutputPaths = []string{*globalLogToFile}
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
			return errcode.TODO.Wrap(err)
		}

		if *globalLibp2pDebug {
			ipfs_log.SetDebugLogging()
		}

		if *globalOrbitDebug {
			zap.ReplaceGlobals(logger)
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
		Name:    "mini",
		Usage:   "mini",
		FlagSet: miniClientDemoFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			flush := tracer.InitTracer(*globalTracer, "berty-mini")
			defer flush()
			ctx, span := tracer.NewNamedSpan(context.Background(), "cmd-root")
			defer span.End()

			rootDS, dsLock, err := getRootDatastore(ctx, miniClientDemoPath)
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

			rdvpeer := &peer.AddrInfo{}
			if *miniClientDemoRDVP != "" {
				resoveCtx, cancel := context.WithTimeout(ctx, ResolveTimeout)
				defer cancel()

				rdvpeer, err = ipfsutil.ParseAndResolveIpfsAddr(resoveCtx, DevRendezVousPoint)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				fds := make([]zapcore.Field, len(rdvpeer.Addrs))
				for i, maddr := range rdvpeer.Addrs {
					key := fmt.Sprintf("#%d", i)
					fds[i] = zap.String(key, maddr.String())
				}
				logger.Info("rdvp peer resolved addrs", fds...)
			} else {
				logger.Warn("no rendezvous peer set")
			}

			l := zap.NewNop()
			if *globalLogToFile != "" {
				l = logger
			}

			mini.Main(ctx, &mini.Opts{
				RemoteAddr:      remoteAddr,
				GroupInvitation: *miniClientDemoGroup,
				Port:            *miniClientDemoPort,
				RootDS:          rootDS,
				Logger:          l,
				Bootstrap:       DefaultBootstrap,
				RendezVousPeer:  rdvpeer,
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

			flush := tracer.InitTracer(*globalTracer, "berty-daemon")
			defer flush()
			ctx, span := tracer.NewNamedSpan(context.Background(), "cmd-root")
			defer span.End()

			var api iface.CoreAPI
			{
				var err error
				var bopts = ipfsutil.CoreAPIConfig{
					SwarmAddrs:        []string{DefaultMCBind},
					ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))),
				}

				bopts.BootstrapAddrs = DefaultBootstrap

				var rdvpeer *peer.AddrInfo
				var crouting <-chan *ipfsutil.RoutingOut

				if *clientProtocolRDVP != "" {
					resoveCtx, cancel := context.WithTimeout(ctx, ResolveTimeout)
					defer cancel()

					if rdvpeer, err = ipfsutil.ParseAndResolveIpfsAddr(resoveCtx, DevRendezVousPoint); err != nil {
						return errors.New("failed to parse rdvp multiaddr: " + *clientProtocolRDVP)
					} else { // should be a valid rendezvous peer
						bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, *clientProtocolRDVP)
						bopts.Routing, crouting = ipfsutil.NewTinderRouting(logger, rdvpeer, false)
					}
				}

				var node *core.IpfsNode
				if api, node, err = ipfsutil.NewCoreAPI(ctx, &bopts); err != nil {
					return err
				}

				defer node.Close()

				if crouting != nil {
					routingOut := <-crouting
					defer routingOut.IpfsDHT.Close()

					if *clientProtocolRDVPFroce {
						go func() {
							// monitor rdv peer
							monitorPeers(logger, node.PeerHost, rdvpeer.ID)
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

			// protocol
			var protocol bertyprotocol.Service
			{

				rootDS, dsLock, err := getRootDatastore(ctx, clientProtocolPath)
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

	groupinit := &ffcli.Command{
		Name:  "groupinit",
		Usage: "berty groupinit - initialize a new multi member group",
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
		Subcommands: []*ffcli.Command{daemon, banner, version, mini, groupinit},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}

func getRootDatastore(ctx context.Context, optPath *string) (datastore.Batching, *fslock.Lock, error) {
	var (
		baseDS datastore.Batching = sync_ds.MutexWrap(datastore.NewMapDatastore())
		lock   *fslock.Lock
	)

	ctx, span := tracer.NewSpan(ctx)
	defer span.End()

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
