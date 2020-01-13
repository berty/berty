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

type ProtocolBridge interface {
	Bridge
}

type protocol struct {
	Bridge

	grpcServer     *grpc.Server
	protocolDB     *gorm.DB
	protocolClient bertyprotocol.Client
	logger         *zap.Logger
}

type ProtocolOpts struct {
	LogLevel   string
	BridgeOpts *BridgeOpts

	coreAPI ipfs_interface.CoreAPI
}

func NewProtocolBridge(opts *ProtocolOpts) (ProtocolBridge, error) {
	// setup logger
	var logger *zap.Logger
	{
		var err error

		logger, err = newLogger(opts.LogLevel)
		if err != nil {
			return nil, err
		}
	}

	return newProtocolBridge(logger, opts)

}

func newProtocolBridge(logger *zap.Logger, opts *ProtocolOpts) (ProtocolBridge, error) {
	b := &protocol{
		grpcServer: grpc.NewServer(),
		logger:     logger,
	}

	// setup protocol
	{
		var err error

		b.protocolDB, err = gorm.Open("sqlite3", ":memory:")
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		// initialize new protocol client
		protocolOpts := bertyprotocol.Opts{
			Logger:      b.logger.Named("bertyprotocol"),
			IpfsCoreAPI: opts.coreAPI,
		}

		b.protocolClient, err = bertyprotocol.New(b.protocolDB, protocolOpts)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	// register service
	bertyprotocol.RegisterProtocolServiceServer(b.grpcServer, b.protocolClient)

	// setup bridge
	{
		var err error

		b.Bridge, err = newBridge(b.grpcServer, logger, opts.BridgeOpts)
		if err != nil {
			return nil, err
		}
	}

	return b, nil
}

func (b *protocol) Close() (err error) {
	// Close bridge
	err = b.Bridge.Close()

	// close clients and dbs after listeners
	b.protocolClient.Close()
	b.protocolDB.Close()

	return
}
