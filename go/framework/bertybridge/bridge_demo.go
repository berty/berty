package bertybridge

import (
	"context"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertydemo"
	"berty.tech/berty/v2/go/pkg/errcode"

	"go.uber.org/zap"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/peer"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/pkg/errors"

	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport"
	libp2p "github.com/libp2p/go-libp2p"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var defaultDemoRendezVousPeer = config.BertyMobile.RendezVousPeer
var defaultDemoBootstrap = config.BertyMobile.Bootstrap
var defaultDemoMCBind = config.BertyMobile.DefaultMCBind

// type DemoBridge Bridge

type Demo struct {
	*Bridge

	service *bertydemo.Service
	dht     *dht.IpfsDHT
	node    *core.IpfsNode
}

type DemoConfig struct {
	*Config

	dLogger  NativeLoggerDriver
	loglevel string

	swarmListeners   []string
	orbitDBDirectory string

	// internal
	coreAPI ipfs_interface.CoreAPI
}

func NewDemoConfig() *DemoConfig {
	return &DemoConfig{
		Config: NewConfig(),
	}
}

func (dc *DemoConfig) OrbitDBDirectory(dir string) {
	dc.orbitDBDirectory = dir
}

func (dc *DemoConfig) LogLevel(level string) {
	dc.loglevel = level
}

func (dc *DemoConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	dc.dLogger = dLogger
}

func (dc *DemoConfig) AddSwarmListener(laddr string) {
	dc.swarmListeners = append(dc.swarmListeners, laddr)
}

func NewDemoBridge(config *DemoConfig) (*Demo, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		if config.dLogger != nil {
			logger, err = newNativeLogger(config.loglevel, config.dLogger)
		} else {
			logger, err = newLogger(config.loglevel)
		}

		if err != nil {
			return nil, err
		}
	}

	return newDemoBridge(logger, config)
}

func newDemoBridge(logger *zap.Logger, config *DemoConfig) (*Demo, error) {
	ctx := context.Background()

	// setup demo
	var service *bertydemo.Service
	var node *core.IpfsNode
	var dht *dht.IpfsDHT

	{
		var err error

		if config.coreAPI == nil {
			var bopts = ipfsutil.CoreAPIConfig{
				BootstrapAddrs:    defaultDemoBootstrap,
				SwarmAddrs:        []string{defaultDemoMCBind},
				ExtraLibp2pOption: libp2p.ChainOptions(libp2p.Transport(mc.NewTransportConstructorWithLogger(logger))),
			}

			var rdvpeer *peer.AddrInfo
			var crouting <-chan *ipfsutil.RoutingOut

			if rdvpeer, err = ipfsutil.ParseAndResolveIpfsAddr(ctx, defaultDemoRendezVousPeer); err != nil {
				return nil, errors.New("failed to parse rdvp multiaddr: " + defaultDemoRendezVousPeer)
			} else { // should be a valid rendezvous peer
				bopts.BootstrapAddrs = append(bopts.BootstrapAddrs, defaultDemoRendezVousPeer)
				bopts.Routing, crouting = ipfsutil.NewTinderRouting(logger, rdvpeer, false)
			}

			if len(config.swarmListeners) > 0 {
				bopts.SwarmAddrs = append(bopts.SwarmAddrs, config.swarmListeners...)
			}

			config.coreAPI, node, err = ipfsutil.NewCoreAPI(ctx, &bopts)
			if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}

			out := <-crouting
			dht = out.IpfsDHT
		}

		directory := ":memory:"
		if config.orbitDBDirectory != "" {
			directory = config.orbitDBDirectory
		}

		opts := &bertydemo.Opts{
			Logger:           logger.Named("demo"),
			CoreAPI:          config.coreAPI,
			OrbitDBDirectory: directory,
		}

		if service, err = bertydemo.New(opts); err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		ipfsinfos := getIPFSZapInfosFields(ctx, config.coreAPI)
		logger.Info("ipfs infos", ipfsinfos...)

	}

	// register service
	var grpcServer *grpc.Server
	{
		grpcLogger := logger.Named("grpc.demo")
		// Define customfunc to handle panic
		panicHandler := func(p interface{}) (err error) {
			return status.Errorf(codes.Unknown, "panic recover: %v", p)
		}

		// Shared options for the logger, with a custom gRPC code to log level function.
		recoverOpts := []grpc_recovery.Option{
			grpc_recovery.WithRecoveryHandler(panicHandler),
		}

		zapOpts := []grpc_zap.Option{
			grpc_zap.WithLevels(grpcCodeToLevel),
		}

		// setup grpc with zap
		grpc_zap.ReplaceGrpcLoggerV2(grpcLogger)
		grpcServer = grpc.NewServer(
			grpc_middleware.WithUnaryServerChain(
				grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),

				grpc_zap.UnaryServerInterceptor(grpcLogger, zapOpts...),
				grpc_recovery.UnaryServerInterceptor(recoverOpts...),
			),
			grpc_middleware.WithStreamServerChain(
				grpc_ctxtags.StreamServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
				grpc_zap.StreamServerInterceptor(grpcLogger, zapOpts...),
				grpc_recovery.StreamServerInterceptor(recoverOpts...),
			),
		)

		bertydemo.RegisterDemoServiceServer(grpcServer, service)
	}

	// setup bridge
	var bridge *Bridge
	{
		var err error

		bridge, err = newBridge(grpcServer, logger, config.Config)
		if err != nil {
			return nil, err
		}
	}

	// setup bridge
	return &Demo{
		Bridge: bridge,

		service: service,
		dht:     dht,
		node:    node,
	}, nil
}

func (d *Demo) Close() (err error) {
	// Close bridge
	err = d.Bridge.Close()

	// close service
	d.service.Close()

	if d.dht != nil {
		d.dht.Close()
	}

	if d.node != nil {
		d.node.Close()
	}

	return
}
