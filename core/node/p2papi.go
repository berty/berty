package node

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
)

type p2papi struct{}

func WithP2PGrpcServer(gs *grpc.Server) nodeOptions {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) Handle(context.Context, *p2p.Event) (*p2p.Void, error) {
	return nil, fmt.Errorf("not implemented")
}
