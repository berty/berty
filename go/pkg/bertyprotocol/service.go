package bertyprotocol

import (
	"context"

	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/protocoldb"
	"berty.tech/berty/go/pkg/errcode"
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var _ Service = (*service)(nil)

// Service is the main Berty Protocol interface
type Service interface {
	ProtocolServiceServer

	Close() error
	Status() Status
}

type service struct {
	// variables
	db          *gorm.DB
	logger      *zap.Logger
	ipfsCoreAPI ipfs_coreapi.CoreAPI
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger      *zap.Logger
	IpfsCoreAPI ipfs_coreapi.CoreAPI
	RootContext context.Context
}

// New initializes a new Client
func New(db *gorm.DB, opts Opts) (Service, error) {
	service := &service{
		db:          db,
		ipfsCoreAPI: opts.IpfsCoreAPI,
		logger:      opts.Logger,
	}

	if opts.Logger == nil {
		service.logger = zap.NewNop()
	}

	var err error
	service.db, err = protocoldb.InitMigrate(db, service.logger.Named("datastore"))
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	ctx := opts.RootContext
	if ctx == nil {
		ctx = context.TODO()
	}
	if opts.IpfsCoreAPI == nil {
		var err error
		service.ipfsCoreAPI, _, err = ipfsutil.NewInMemoryCoreAPI(ctx)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	return service, nil
}

func (c *service) Close() error {
	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol error
}

func (c *service) Status() Status {
	return Status{
		DB:       c.db.DB().Ping(),
		Protocol: nil,
	}
}
