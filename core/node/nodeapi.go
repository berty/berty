package node

import (
	"context"

	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/sql"
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
	return ErrNotImplemented
}

// EventStream implements berty.node.EventStream
func (n *Node) EventStream(*node.Void, node.Service_EventStreamServer) error {
	return ErrNotImplemented
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(_ context.Context, input *entity.Contact) (*entity.Contact, error) {
	// input validation
	if err := input.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}
	contact, err := sql.FindContact(n.sql, input)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get contact")
	}

	// mark contact as friend
	contact.Status = entity.Contact_IsFriend
	if err := n.sql.Save(contact).Error; err != nil {
		return nil, err
	}

	// send ContactRequestAccepted event
	event := n.NewContactEvent(contact, p2p.Kind_ContactRequestAccepted)
	if err != nil {
		return nil, err
	}
	if err := n.EnqueueOutgoingEvent(event); err != nil {
		return nil, err
	}

	// send ContactShareMe event
	if err := n.contactShareMe(contact); err != nil {
		return nil, err
	}

	return contact, nil
}

// ContactRequest implements berty.node.ContactRequest
func (n *Node) ContactRequest(ctx context.Context, req *node.ContactRequestInput) (*entity.Contact, error) {
	// input validation
	if err := req.Contact.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}

	// check for duplicate
	_, err := sql.FindContact(n.sql, req.Contact)
	if err == nil {
		return nil, ErrEntityAlreadyExists
	}

	// save contact in database
	contact := req.Contact
	contact.Status = entity.Contact_IsRequested
	if err = n.sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
		return nil, errors.Wrap(err, "failed to save contact")
	}

	// send request to peer
	event := n.NewContactEvent(contact, p2p.Kind_ContactRequest)
	if err := event.SetAttrs(&p2p.ContactRequestAttrs{
		Me: &entity.Contact{
			ID:          n.UserID(),
			DisplayName: n.config.Myself.DisplayName,
		},
		IntroMessage: req.IntroMessage,
	}); err != nil {
		return nil, err
	}
	if err := n.EnqueueOutgoingEvent(event); err != nil {
		return nil, err
	}

	return contact, nil
}

// ContactUpdate implements berty.node.ContactUpdate
func (n *Node) ContactUpdate(_ context.Context, contact *entity.Contact) (*entity.Contact, error) {
	// input validation
	if contact == nil || contact.ID == "" {
		return nil, ErrInvalidInput
	}
	if err := contact.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}

	// FIXME: protect import fields from updatind

	return contact, n.sql.Save(contact).Error
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(_ context.Context, contact *entity.Contact) (*entity.Contact, error) {
	// input validation
	if contact == nil || contact.ID == "" {
		return nil, ErrInvalidInput
	}

	if err := contact.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}

	// FIXME: should not be able to delete myself

	// remove from sql
	return contact, n.sql.Delete(contact).Error
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(_ *node.Void, stream node.Service_ContactListServer) error {
	var contacts []*entity.Contact
	if err := n.sql.Find(&contacts).Error; err != nil {
		return errors.Wrap(err, "failed to get contacts from database")
	}

	for _, contact := range contacts {
		if err := stream.Send(contact); err != nil {
			return err
		}
	}
	return nil
}
