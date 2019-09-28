package bertyprotocol

import (
	"log"

	"github.com/jinzhu/gorm"
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
	Logger *log.Logger
}

// New initializes a new Client
func New(db *gorm.DB, opts Opts) Client {
	return &client{
		db:   db,
		opts: opts,
	}
}

func (c *client) Close() {}
