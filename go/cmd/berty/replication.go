package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"math/rand"
	"strings"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/pubsub/directchannel"
	"berty.tech/go-orbit-db/pubsub/pubsubraw"
	grpcgw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/ipfs/go-datastore"
	"github.com/ipfs/go-ipfs/core"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/peerstore"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"
	"golang.org/x/crypto/ed25519"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func replicationServerCommand() *ffcli.Command {
	var replFlags = flag.NewFlagSet("replication server", flag.ExitOnError)
	replFlags.StringVar(&opts.datastorePath, "d", opts.datastorePath, "datastore base directory")
	replFlags.StringVar(&opts.rdvpMaddr, "rdvp", opts.rdvpMaddr, "rendezvous point maddr")
	replFlags.StringVar(&opts.daemonListeners, "l", opts.daemonListeners, "grpc listener")
	replFlags.StringVar(&opts.serviceProviderSecret, "secret", opts.serviceProviderSecret, "auth tokens secret")
	replFlags.StringVar(&opts.serviceProviderAuthPK, "pk", opts.serviceProviderAuthPK, "auth token sig pk")

	return &ffcli.Command{
		Name:      "repl-server",
		ShortHelp: "replication server",
		FlagSet:   replFlags,
		Exec: func(ctx context.Context, args []string) error {
			var (
				workers      run.Group
				err          error
				node         *core.IpfsNode
				api          ipfsutil.ExtendedCoreAPI
				ps           *pubsub.PubSub
				disc         tinder.Driver
				grpcServer   *grpc.Server
				grpcServeMux *grpcgw.ServeMux
			)

			cleanup := globalPreRun()
			defer cleanup()

			secret, err := base64.RawStdEncoding.DecodeString(opts.serviceProviderSecret)
			if err != nil {
				return err
			}

			pkBytes, err := base64.RawStdEncoding.DecodeString(opts.serviceProviderAuthPK)
			if err != nil {
				return err
			}

			if len(pkBytes) != ed25519.PublicKeySize {
				return fmt.Errorf("invalid pk size")
			}

			pk := ed25519.PublicKey(pkBytes)
			man, err := bertyprotocol.NewAuthTokenVerifier(secret, pk)
			if err != nil {
				return err
			}

			rdvpeer, err := parseRdvpMaddr(ctx, opts.rdvpMaddr, opts.logger)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			var bopts = ipfsutil.CoreAPIConfig{
				SwarmAddrs:        config.BertyDev.DefaultSwarmAddrs,
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

			rootDS, dsLock, err := getRootDatastore(opts.datastorePath)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			if dsLock != nil {
				defer func() { _ = dsLock.Unlock() }()
			}
			defer rootDS.Close()

			odbCache := bertyprotocol.NewOrbitDatastoreCache(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("orbitdb")))

			odbOpts := &orbitdb.NewOrbitDBOptions{
				Cache:                odbCache,
				Directory:            &opts.datastorePath,
				Logger:               opts.logger.Named("odb"),
				Tracer:               tracer.New("berty-orbitdb"),
				DirectChannelFactory: directchannel.InitDirectChannelFactory(node.PeerHost),
				PubSub:               pubsubraw.NewPubSub(ps, node.PeerHost.ID(), opts.logger, nil),
			}

			odb, err := bertyprotocol.NewBertyOrbitDB(ctx, api, nil, nil, odbOpts)
			if err != nil {
				return err
			}

			replicationManager, err := bertyprotocol.NewReplicationManager(ctx, rootDS, odb, opts.logger)
			if err != nil {
				return err
			}

			replicationService := bertyprotocol.NewReplicationService(replicationManager)

			_ = man // TODO: enable auth
			grpcServer = grpc.NewServer(
			// grpc.UnaryInterceptor(grpc_auth.UnaryServerInterceptor(man.GRPCAuthInterceptor(bertyprotocol.ServiceReplicationID))),
			)
			grpcServeMux = grpcgw.NewServeMux()

			bertyprotocol.RegisterReplicationServiceServer(grpcServer, replicationService)
			if err := bertyprotocol.RegisterReplicationServiceHandlerServer(ctx, grpcServeMux, replicationService); err != nil {
				return errcode.TODO.Wrap(err)
			}

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
				})
			}

			return workers.Run()
		},
	}
}
