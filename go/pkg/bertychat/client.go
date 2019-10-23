package bertychat

import (
	"berty.tech/go/internal/chatdb"
	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	AccountServer

	Close() error
	Status() Status
}

type client struct {
	// variables
	db       *gorm.DB
	protocol bertyprotocol.Client
	logger   *zap.Logger
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger *zap.Logger
}

// New initializes a new Client
func New(db *gorm.DB, protocol bertyprotocol.Client, opts Opts) (Client, error) {
	client := client{
		db:       db,
		protocol: protocol,
		logger:   opts.Logger,
	}

	if opts.Logger == nil {
		client.logger = zap.NewNop()
	}

	var err error
	client.db, err = chatdb.InitMigrate(client.db, client.logger.Named("datastore"))
	if err != nil {
		return nil, errcode.ChatTODO.Wrap(err)
	}

	return &client, nil
}

func (c *client) Close() error {
	return nil
}

// Status contains results of status checks
type Status struct {
	DB       error
	Protocol bertyprotocol.Status
	Chat     error
	// Network
	// Crypto
}

func (c *client) Status() Status {
	return Status{
		DB:       c.db.DB().Ping(),
		Protocol: c.protocol.Status(),
		Chat:     nil,
		// Network
		// Crypto
	}
}
