package bertychat

import (
	"berty.tech/go/internal/chatdb"
	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/errcode"
	"github.com/bwmarrin/snowflake"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	ChatServiceServer

	Close() error
	Status() Status
}

type client struct {
	// variables
	db            *gorm.DB
	protocol      bertyprotocol.Client
	logger        *zap.Logger
	snowflakeNode *snowflake.Node
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger        *zap.Logger
	SnowflakeNode *snowflake.Node
}

// New initializes a new Client
func New(db *gorm.DB, protocol bertyprotocol.Client, opts Opts) (Client, error) {
	client := client{
		db:            db,
		protocol:      protocol,
		logger:        opts.Logger,
		snowflakeNode: opts.SnowflakeNode,
	}

	if opts.Logger == nil {
		client.logger = zap.NewNop()
	}

	if opts.SnowflakeNode == nil {
		var err error
		client.snowflakeNode, err = snowflake.NewNode(1)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	var err error
	client.db, err = chatdb.InitMigrate(client.db, client.snowflakeNode, client.logger.Named("datastore"))
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
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
