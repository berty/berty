package bertyprotocol

import (
	context "context"

	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	InstanceServer

	Close() error
	Status() Status

	LogIPFSInformations()
}

type client struct {
	// variables
	db          *gorm.DB
	opts        Opts
	ipfsCoreAPI ipfs_coreapi.CoreAPI
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger *zap.Logger
}

// New initializes a new Client
func New(db *gorm.DB, IpfsCoreAPI ipfs_coreapi.CoreAPI, opts Opts) (Client, error) {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	return &client{
		db:          db,
		opts:        opts,
		ipfsCoreAPI: IpfsCoreAPI,
	}, nil
}

func (c *client) LogIPFSInformations() {
	key, err := c.ipfsCoreAPI.Key().Self(context.TODO())
	if err != nil {
		c.opts.Logger.Error("unable to log ipfs identity", zap.Error(err))
		return
	}

	maddrs, err := c.ipfsCoreAPI.Swarm().ListenAddrs(context.TODO())
	if err != nil {
		c.opts.Logger.Error("unable to log ipfs listener", zap.Error(err))
		return
	}

	addrs := make([]string, len(maddrs))
	for i, addr := range maddrs {
		addrs[i] = addr.String()
	}

	c.opts.Logger.Info("ipfs node",
		zap.String("PeerID", key.ID().Pretty()),
		zap.Strings("Listeners", addrs),
	)
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
