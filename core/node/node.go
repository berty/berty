package node

type Node struct{}

func New(opts ...nodeOptions) *Node {
	n := &Node{}

	for _, opt := range opts {
		opt(n)
	}
	return n
}

type nodeOptions func(n *Node)
