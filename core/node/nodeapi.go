package node

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/entity"
	"github.com/berty/berty/core/api/node"
)

type nodeapi struct{}

func WithNodeGrpcServer(gs *grpc.Server) nodeOptions {
	return func(n *Node) {
		node.RegisterServiceServer(gs, n)
	}
}

// events

func (n *Node) EventList(*node.Void, node.Service_EventListServer) error {
	return fmt.Errorf("not implemented")
}

func (n *Node) EventStream(*node.Void, node.Service_EventStreamServer) error {
	return fmt.Errorf("not implemented")
}

// contacts

func (n *Node) ContactAcceptRequest(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

func (n *Node) ContactRequest(context.Context, *node.ContactRequestInput) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

func (n *Node) ContactUpdate(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

func (n *Node) ContactRemove(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

func (n *Node) ContactList(*node.Void, node.Service_ContactListServer) error {
	return fmt.Errorf("not implemented")
}
