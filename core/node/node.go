package node

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
)

// Node is the top-level object of a Berty peer
type Node struct {
	sql            *gorm.DB
	myself         *entity.Contact
	outgoingEvents chan *p2p.Event
}

// New initializes a new Node object
func New(opts ...NewNodeOption) *Node {
	n := &Node{
		// FIXME: fetch myself from db
		myself:         &entity.Contact{ID: "init"},
		outgoingEvents: make(chan *p2p.Event, 100),
	}

	for _, opt := range opts {
		opt(n)
	}
	return n
}

// Start is the node's mainloop
func (n *Node) Start() error {
	if err := n.Validate(); err != nil {
		return errors.Wrap(err, "node is misconfigured")
	}
	select {}
}

// Validate returns an error if object is invalid
func (n *Node) Validate() error {
	if n == nil || n.sql == nil {
		return errors.New("missing required fields")
	}
	return nil
}

// NewNodeOption is a callback used to configure a Node during intiailization phase
type NewNodeOption func(n *Node)

// NewID returns a unique ID prefixed with our contact ID
func (n *Node) NewID() string {
	return fmt.Sprintf("%s:%s", n.myself.ID, uuid.Must(uuid.NewV4()).String())
}
