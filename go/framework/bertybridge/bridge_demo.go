package bertybridge

import (
	"context"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertydemo"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// type DemoBridge Bridge

type Demo struct {
	*Bridge

	client *bertydemo.Client
}

type DemoConfig struct {
	*Config

	dLogger  NativeLoggerDriver
	loglevel string

	swarmListeners   []string
	orbitDBDirectory string
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

	return newDemoBridge(logger.Named("demo"), config)
}

func newDemoBridge(logger *zap.Logger, config *DemoConfig) (*Demo, error) {
	ctx := context.Background()

	// setup demo
	var client *bertydemo.Client
	{
		var err error

		swarmaddrs := []string{}
		if len(config.swarmListeners) > 0 {
			swarmaddrs = config.swarmListeners
		}

		var api ipfs_interface.CoreAPI
		api, _, err = ipfsutil.NewInMemoryCoreAPI(ctx, swarmaddrs...)
		if err != nil {
			return nil, err
		}

		directory := ":memory:"
		if config.orbitDBDirectory != "" {
			directory = config.orbitDBDirectory
		}

		opts := &bertydemo.Opts{
			Logger:           logger,
			CoreAPI:          api,
			OrbitDBDirectory: directory,
		}

		if client, err = bertydemo.New(opts); err != nil {
			return nil, err
		}

		ipfsinfos := getIPFSZapInfosFields(ctx, api)
		logger.Info("ipfs infos", ipfsinfos...)
	}

	// register service
	var grpcServer *grpc.Server
	{
		grpcLogger := logger.Named("grpc")
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

		bertydemo.RegisterDemoServiceServer(grpcServer, client)
	}

	var bridge *Bridge
	// setup bridge
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
		client: client,
	}, nil
}

func (d *Demo) Close() (err error) {
	// Close bridge
	err = d.Bridge.Close()

	// close others
	d.client.Close()
	return
}
