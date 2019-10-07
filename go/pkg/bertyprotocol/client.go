package bertyprotocol

import (
	"github.com/jinzhu/gorm"
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
	db   *gorm.DB
	opts Opts
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger *zap.Logger
}

// New initializes a new Client
func New(db *gorm.DB, opts Opts) (Client, error) {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	return &client{
		db:   db,
		opts: opts,
	}, nil
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
