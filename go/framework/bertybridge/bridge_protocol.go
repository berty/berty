package bertybridge

import (
	"context"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"go.uber.org/zap"

	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type Protocol struct {
	*Bridge

	node    *core.IpfsNode
	service bertyprotocol.Service
}

type ProtocolConfig struct {
	*Config

	dLogger  NativeLoggerDriver
	loglevel string

	swarmListeners   []string
	orbitDBDirectory string

	// internal
	coreAPI ipfs_interface.CoreAPI
}

func NewProtocolConfig() *ProtocolConfig {
	return &ProtocolConfig{
		Config: NewConfig(),
	}
}

func (pc *ProtocolConfig) OrbitDBDirectory(dir string) {
	pc.orbitDBDirectory = dir
}

func (pc *ProtocolConfig) LogLevel(level string) {
	pc.loglevel = level
}

func (pc *ProtocolConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	pc.dLogger = dLogger
}

func (pc *ProtocolConfig) AddSwarmListener(laddr string) {
	pc.swarmListeners = append(pc.swarmListeners, laddr)
}

func NewProtocolBridge(config *ProtocolConfig) (*Protocol, error) {
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

	return newProtocolBridge(logger, config)
}

func newProtocolBridge(logger *zap.Logger, config *ProtocolConfig) (*Protocol, error) {
	ctx := context.Background()

	// setup coreapi if needed
	var api ipfs_interface.CoreAPI
	var node *core.IpfsNode
	{
		var err error

		if api = config.coreAPI; api == nil {
			swarmaddrs := []string{}
			if len(config.swarmListeners) > 0 {
				swarmaddrs = config.swarmListeners
			}

			api, node, err = ipfsutil.NewInMemoryCoreAPI(ctx, swarmaddrs...)
			if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}
		}
	}

	// setup protocol
	var service bertyprotocol.Service
	{
		var err error

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger:          logger.Named("bertyprotocol"),
			IpfsCoreAPI:     api,
			DeviceKeystore:  bertyprotocol.NewDeviceKeystore(keystore.NewMemKeystore()),
			MessageKeystore: bertyprotocol.NewInMemMessageKeystore(),
		}

		service, err = bertyprotocol.New(protocolOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// register service
	var grpcServer *grpc.Server
	{
		grpcLogger := logger.Named("grpc.protocol")
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

		bertyprotocol.RegisterProtocolServiceServer(grpcServer, service)
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

	return &Protocol{
		Bridge: bridge,

		service: service,
		node:    node,
	}, nil
}

func (p *Protocol) Close() (err error) {
	// Close bridge
	err = p.Bridge.Close()

	// close clients and dbs after listeners
	p.service.Close()

	if p.node != nil {
		p.node.Close()
	}

	return
}
