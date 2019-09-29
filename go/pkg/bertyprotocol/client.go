package bertyprotocol

import (
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var _ Client = (*client)(nil)

// Client is the main Berty Protocol interface
type Client interface {
	AccountManagerServer
	ClientManagerServer
	ContactManagerServer
	ContactRequestManagerServer
	EventManagerServer
	GroupInvitationManagerServer
	GroupManagerServer
	StreamManagerServer

	Close()
}

type client struct {
	// variables
	db   *gorm.DB
	opts Opts

	// list of implemented interfaces
	AccountManagerServer
	ClientManagerServer
	ContactManagerServer
	ContactRequestManagerServer
	EventManagerServer
	GroupInvitationManagerServer
	GroupManagerServer
	StreamManagerServer
	Client
}

// Opts contains optional configuration flags for building a new Client
type Opts struct {
	Logger *zap.Logger
}

// New initializes a new Client
func New(db *gorm.DB, opts Opts) Client {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}
	return &client{
		db:   db,
		opts: opts,
	}
}

func (c *client) Close() {}
