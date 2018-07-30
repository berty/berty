package node

import (
	"context"

	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

// Handle implements berty.p2p.Handle
func (n *Node) Handle(context.Context, *p2p.Event) (*p2p.Void, error) {
	return nil, ErrNotImplemented
}
