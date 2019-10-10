package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/protocoldb"
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	InstanceServer

	Close() error
	Status() Status
}

type client struct {
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
func New(db *gorm.DB, opts Opts) (Client, error) {
	client := &client{
		db:          db,
		ipfsCoreAPI: opts.IpfsCoreAPI,
		logger:      opts.Logger,
	}

	if opts.Logger == nil {
		client.logger = zap.NewNop()
	}

	var err error
	client.db, err = protocoldb.InitMigrate(db, client.logger.Named("datastore"))
	if err != nil {
		return nil, errors.Wrap(err, "failed to initialize datastore")
	}

	ctx := opts.RootContext
	if ctx == nil {
		ctx = context.TODO()
	}
	if opts.IpfsCoreAPI == nil {
		var err error
		client.ipfsCoreAPI, err = ipfsutil.NewInMemoryCoreAPI(ctx)
		if err != nil {
			return nil, errors.Wrap(err, "failed to initialize ipfsutil")
		}
	}

	return client, nil
}

func (c *client) Close() error {
	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol error
}

func (c *client) Status() Status {
	return Status{
		DB:       c.db.DB().Ping(),
		Protocol: nil,
	}
}
