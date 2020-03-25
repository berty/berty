package bertybridge

import (
	"berty.tech/berty/v2/go/internal/account"
	"berty.tech/berty/v2/go/internal/orbitutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	keystore "github.com/ipfs/go-ipfs-keystore"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Protocol struct {
	*Bridge

	client bertyprotocol.Client
}

type ProtocolConfig struct {
	*Config

	dLogger  NativeLoggerDriver
	loglevel string

	coreAPI ipfs_interface.CoreAPI
}

func NewProtocolConfig() *ProtocolConfig {
	return &ProtocolConfig{
		Config: NewConfig(),
	}
}

func (pc *ProtocolConfig) LogLevel(level string) {
	pc.loglevel = level
}

func (pc *ProtocolConfig) LoggerDriver(dLogger NativeLoggerDriver) {
	pc.dLogger = dLogger
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
	protocol := &Protocol{}

	// setup protocol
	{
		var err error

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger:        logger.Named("bertyprotocol"),
			IpfsCoreAPI:   config.coreAPI,
			Account:       account.New(keystore.NewMemKeystore()),
			MessageKeys:   bertyprotocol.NewInMemoryMessageKeys(),
			DBConstructor: orbitutil.NewBertyOrbitDB,
		}

		protocol.client, err = bertyprotocol.New(protocolOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// register service
	grpcServer := grpc.NewServer()
	bertyprotocol.RegisterProtocolServiceServer(grpcServer, protocol.client)

	// setup bridge
	{
		var err error

		protocol.Bridge, err = newBridge(grpcServer, logger, config.Config)
		if err != nil {
			return nil, err
		}
	}

	return protocol, nil
}

func (p *Protocol) Close() (err error) {
	// Close bridge
	err = p.Bridge.Close()

	// close clients and dbs after listeners
	p.client.Close()

	return
}
