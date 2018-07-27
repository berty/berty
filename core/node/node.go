package node

import "github.com/jinzhu/gorm"

// Node is the top-level object of a Berty peer
type Node struct {
	db *gorm.DB
}

// New initializes a new Node object
func New(opts ...NewNodeOption) *Node {
	n := &Node{}

	for _, opt := range opts {
		opt(n)
	}
	return n
}

// Start is the node's mainloop
func (n *Node) Start() error {
	select {}
}

// NewNodeOption is a callback used to configure a Node during intiailization phase
type NewNodeOption func(n *Node)
