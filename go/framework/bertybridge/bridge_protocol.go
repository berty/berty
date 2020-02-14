package bertybridge

import (
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"

	"github.com/jinzhu/gorm"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

type Protocol struct {
	*Bridge

	db     *gorm.DB
	client bertyprotocol.Client
}

type ProtocolConfig struct {
	*Config

	loglevel string
	coreAPI  ipfs_interface.CoreAPI
}

func NewProtocolConfig() *ProtocolConfig {
	return &ProtocolConfig{
		Config: NewConfig(),
	}
}

func (pc *ProtocolConfig) LogLevel(level string) {
	pc.loglevel = level
}

func (pc *ProtocolConfig) ipfsCoreAPI(api ipfs_interface.CoreAPI) {
	pc.coreAPI = api
}

func NewProtocolBridge(config *ProtocolConfig) (*Protocol, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		logger, err = newLogger(config.loglevel)
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

		protocol.db, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger:      logger.Named("bertyprotocol"),
			IpfsCoreAPI: config.coreAPI,
		}

		protocol.client, err = bertyprotocol.New(protocol.db, protocolOpts)
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
	p.db.Close()

	return
}
