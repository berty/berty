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
	clientEvents   chan *p2p.Event
	outgoingEvents chan *p2p.Event
}

// New initializes a new Node object
func New(opts ...NewNodeOption) (*Node, error) {
	n := &Node{
		// FIXME: fetch myself from db
		myself:         &entity.Contact{ID: "init"},
		outgoingEvents: make(chan *p2p.Event, 100),
		clientEvents:   make(chan *p2p.Event, 100),
	}

	for _, opt := range opts {
		opt(n)
	}

	if err := n.Validate(); err != nil {
		return nil, errors.Wrap(err, "node is misconfigured")
	}

	return n, nil
}

// Start is the node's mainloop
func (n *Node) Start() error {
	select {}
}

func (n *Node) Close() {}

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

func (n *Node) PeerID() string {
	return n.myself.PeerID()
}

func (n *Node) OutgoingEventsChan() chan *p2p.Event { return n.outgoingEvents }
func (n *Node) ClientEventsChan() chan *p2p.Event   { return n.clientEvents }
