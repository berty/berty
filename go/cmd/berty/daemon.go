package main

import (
	"context"
	"flag"
	"fmt"
	"math/rand"
	"path/filepath"
	"strings"
	"time"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	datastore "github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	peerstore "github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"
	grpc_trace "go.opentelemetry.io/otel/instrumentation/grpctrace"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func daemonCommand() *ffcli.Command {
	var daemonFlags = flag.NewFlagSet("protocol client", flag.ExitOnError)
	daemonFlags.StringVar(&opts.daemonListeners, "l", opts.daemonListeners, "client listeners")
	daemonFlags.StringVar(&opts.datastorePath, "d", opts.datastorePath, "datastore base directory")
	daemonFlags.StringVar(&opts.rdvpMaddr, "rdvp", opts.rdvpMaddr, "rendezvous point maddr")
	daemonFlags.BoolVar(&opts.rdvpForce, "force-rdvp", opts.rdvpForce, "force connect to rendezvous point")

	return &ffcli.Command{
		Name:       "daemon",
		ShortUsage: "berty daemon",
		FlagSet:    daemonFlags,
		ShortHelp:  "start a full Berty instance",
		Exec: func(ctx context.Context, args []string) error {
			cleanup := globalPreRun()
			defer cleanup()

			var (
				node *core.IpfsNode
				api  ipfsutil.ExtendedCoreAPI
				ps   *pubsub.PubSub
				disc tinder.Driver
			)

			{
				rdvpeer, err := parseRdvpMaddr(ctx, opts.rdvpMaddr, opts.logger)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				// var err error
				var bopts = ipfsutil.CoreAPIConfig{
					SwarmAddrs:        config.BertyDev.DefaultSwarmAddrs,
					APIAddrs:          config.BertyDev.DefaultAPIAddrs,
					APIConfig:         config.BertyDev.APIConfig,
					DisableCorePubSub: true,
					ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(opts.logger))),
					HostConfig: func(h host.Host, _ routing.Routing) error {
						var err error

						h.Peerstore().AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
						// @FIXME(gfanton): use rand as argument
						rdvClient := tinder.NewRendezvousDiscovery(opts.logger, h, rdvpeer.ID,
							rand.New(rand.NewSource(rand.Int63())))

						minBackoff, maxBackoff := time.Second, time.Minute
						rng := rand.New(rand.NewSource(rand.Int63()))
						disc, err = tinder.NewService(
							opts.logger,
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

				bopts.BootstrapAddrs = config.BertyDev.Bootstrap

				if api, node, err = ipfsutil.NewCoreAPI(ctx, &bopts); err != nil {
					return err
				}

				defer node.Close()

				// drivers := []tinder.Driver{}
				// if rdvpeer != nil {
				// 	if rdvpeer != nil {
				// 		node.Peerstore.AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
				// 		// @FIXME(gfanton): use rand as argument
				// 		rdvClient := tinder.NewRendezvousDiscovery(opts.logger, node.PeerHost, rdvpeer.ID, rand.New(rand.NewSource(rand.Int63())))
				// 		drivers = append(drivers, rdvClient)
				// 	}

				// 	// if localDiscovery {
				// 	localDiscovery := tinder.NewLocalDiscovery(opts.logger, node.PeerHost, rand.New(rand.NewSource(rand.Int63())))
				// 	drivers = append(drivers, localDiscovery)
				// 	// }

				// 	bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, rdvpMaddr)
				// }

				node.Peerstore.AddAddrs(rdvpeer.ID, rdvpeer.Addrs, peerstore.PermanentAddrTTL)
				// @FIXME(gfanton): use rand as argument
				rdvClient := tinder.NewRendezvousDiscovery(opts.logger, node.PeerHost, rdvpeer.ID,
					rand.New(rand.NewSource(rand.Int63())))
				minBackoff, maxBackoff := time.Second*60, time.Hour
				rng := rand.New(rand.NewSource(rand.Int63()))
				disc, err := tinder.NewService(
					opts.logger,
					rdvClient,
					discovery.NewExponentialBackoff(minBackoff, maxBackoff, discovery.FullJitter, time.Second, 5.0, 0, rng),
				)
				if err != nil {
					return err
				}

				psapi := ipfsutil.NewPubSubAPI(ctx, opts.logger.Named("ps"), disc, ps)
				api = ipfsutil.InjectPubSubCoreAPIExtendedAdaptater(api, psapi)
				ipfsutil.EnableConnLogger(ctx, opts.logger, node.PeerHost)

				// construct http api endpoint
				ipfsutil.ServeHTTPApi(opts.logger, node, "")

				// serve the embedded ipfs webui
				ipfsutil.ServeHTTPWebui(opts.logger)
			}

			// listeners for berty
			var workers run.Group
			ctx, cancel := context.WithCancel(ctx)
			workers.Add(func() error {
				<-ctx.Done()
				return ctx.Err()
			}, func(error) { cancel() })

			var grpcServer *grpc.Server
			var grpcServeMux *grpcgw.ServeMux
			{
				// setup grpc server
				grpcLogger := opts.logger.Named("grpc")
				// Define customfunc to handle panic
				panicHandler := func(p interface{}) (err error) {
					return status.Errorf(codes.Unknown, "panic recover: %v", p)
				}

				// Shared options for the opts.logger, with a custom gRPC code to log level function.
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
				addrs := strings.Split(opts.daemonListeners, ",")
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
						opts.logger.Info("serving", zap.String("maddr", maddr.String()))
						return server.Serve(l)
					}, func(error) {
						l.Close()
						opts.logger.Info("closing done", zap.String("maddr", maddr.String()))
					})
				}
			}

			// protocol
			var protocol bertyprotocol.Service
			{
				rootDS, dsLock, err := getRootDatastore(opts.datastorePath)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if dsLock != nil {
					defer func() { _ = dsLock.Unlock() }()
				}
				defer rootDS.Close()

				deviceDS := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
				mk := bertyprotocol.NewMessageKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("messages")))
				orbitdbDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("orbitdb"))

				// initialize new protocol client
				popts := bertyprotocol.Opts{
					Host:            node.PeerHost,
					PubSub:          ps,
					TinderDriver:    disc,
					IpfsCoreAPI:     api,
					Logger:          opts.logger,
					RootDatastore:   rootDS,
					MessageKeystore: mk,
					DeviceKeystore:  bertyprotocol.NewDeviceKeystore(deviceDS),
					OrbitCache:      bertyprotocol.NewOrbitDatastoreCache(orbitdbDS),
				}
				if opts.datastorePath != "" && opts.datastorePath != ":memory:" {
					popts.OrbitDirectory = filepath.Join(opts.datastorePath, "orbitdb")
				}

				protocol, err = bertyprotocol.New(ctx, popts)
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
				protocolClient, err := bertyprotocol.NewClient(ctx, protocol)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				opts := bertymessenger.Opts{
					Logger:          opts.logger,
					ProtocolService: protocol,
				}
				messenger, err := bertymessenger.New(protocolClient, &opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

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

			opts.logger.Info("client initialized", zap.String("peer-id", info.PeerID), zap.Strings("listeners", info.Listeners))
			return workers.Run()
		},
	}
}
