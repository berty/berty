package node

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/entity"
	"github.com/berty/berty/core/api/node"
)

// WithNodeGrpcServer registers the Node as a 'berty.node' protobuf server implementation
func WithNodeGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		node.RegisterServiceServer(gs, n)
	}
}

//
// events
//

// EventList implements berty.node.EventList
func (n *Node) EventList(*node.Void, node.Service_EventListServer) error {
	return fmt.Errorf("not implemented")
}

// EventStream implements berty.node.EventStream
func (n *Node) EventStream(*node.Void, node.Service_EventStreamServer) error {
	return fmt.Errorf("not implemented")
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

// ContactRequest implements berty.node.ContactRequest
func (n *Node) ContactRequest(context.Context, *node.ContactRequestInput) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

// ContactUpdate implements berty.node.ContactUpdate
func (n *Node) ContactUpdate(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(context.Context, *entity.Contact) (*entity.Contact, error) {
	return nil, fmt.Errorf("not implemented")
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(*node.Void, node.Service_ContactListServer) error {
	return fmt.Errorf("not implemented")
}
