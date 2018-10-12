package node

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/sql"
)

// Node implements ServiceServer
var _ node.ServiceServer = (*Node)(nil)

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
func (n *Node) EventList(input *node.EventListInput, stream node.Service_EventListServer) error {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	var events []*p2p.Event

	if err := n.sql.Where(input.Filter).Find(&events).Error; err != nil {
		return err
	}

	for _, event := range events {
		if err := stream.Send(event); err != nil {
			return err
		}
	}
	return nil
}

func (n *Node) EventListPaginated(ctx context.Context, input *node.EventListInput) (*node.EventListOutput, error) {
	return nil, ErrNotImplemented
}

// GetEvent implements berty.node.GetEvent
func (n *Node) GetEvent(ctx context.Context, event *p2p.Event) (*p2p.Event, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if err := n.sql.First(event, "ID = ?", event.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get event from database")
	}

	return event, nil
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(_ context.Context, input *entity.Contact) (*entity.Contact, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

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
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

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
		IntroText: req.IntroText,
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
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	// input validation
	if contact == nil || contact.ID == "" {
		return nil, ErrInvalidInput
	}
	if err := contact.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}

	// FIXME: protect import fields from updatind

	return contact, n.sql.Model(contact).Update("displayName", contact.DisplayName).Error
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(_ context.Context, contact *entity.Contact) (*entity.Contact, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

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
func (n *Node) ContactList(input *node.ContactListInput, stream node.Service_ContactListServer) error {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	var contacts []*entity.Contact
	var err error
	if input.Filter != nil {
		err = n.sql.Where(input.Filter).Find(&contacts).Error
	} else {
		err = n.sql.Find(&contacts).Error
	}
	if err != nil {
		return errors.Wrap(err, "failed get contacts from database")
	}

	for _, contact := range contacts {
		if err := stream.Send(contact); err != nil {
			return err
		}
	}
	return nil
}

// ContactListPaginated implements berty.node.ContactListPaginated
func (n *Node) ContactListPaginated(ctx context.Context, input *node.ContactListInput) (*node.ContactListOutput, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	output := &node.ContactListOutput{
		Edges: []*node.ContactEdge{},
	}

	var count uint32
	countQuery := n.sql.Model(entity.Contact{}).Where(input.Filter)
	if err := countQuery.Count(&count).Error; err != nil {
		return nil, err
	}

	// apply defaults to paginate
	if input.Paginate == nil {
		input.Paginate = &node.Pagination{}
	}
	if input.Paginate.First == 0 {
		input.Paginate.First = 10
	}
	if input.Paginate.OrderBy == "" {
		input.Paginate.OrderBy = "id"
	}

	// build the query
	fetchQuery := countQuery.Limit(input.Paginate.First).Order(input.Paginate.OrderBy, input.Paginate.OrderDesc)

	if input.Paginate.Last > 0 {
		return nil, errors.Wrap(ErrNotImplemented, "input.Paginate.Last not supported")
	}
	if input.Paginate.Before != "" {
		return nil, errors.Wrap(ErrNotImplemented, "input.Paginate.Before not supported")
	}
	if input.Paginate.After != "" {
		fetchQuery = fetchQuery.Where("id > ?", input.Paginate.After)
	}

	var nodes []*entity.Contact
	if err := fetchQuery.Find(&nodes).Error; err != nil {
		return nil, err
	}

	for _, n := range nodes {
		output.Edges = append(output.Edges, &node.ContactEdge{
			Node:   n,
			Cursor: n.ID,
		})
	}

	output.PageInfo = &node.PageInfo{
		StartCursor:     output.Edges[0].Cursor,
		EndCursor:       output.Edges[len(output.Edges)-1].Cursor,
		HasPreviousPage: input.Paginate.After != "",
		HasNextPage:     len(output.Edges) == int(input.Paginate.First),
		Count:           count,
	}
	logger().Debug("ContactListPaginatedOutput", zap.String("output", fmt.Sprintf("%+v", output)))
	return output, nil
}

// GetContact implements berty.node.GetContact
func (n *Node) GetContact(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if err := n.sql.First(contact, "ID = ?", contact.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get contact from database")
	}

	return contact, nil
}

//
// Conversation
//

func (n *Node) ConversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	members := []*entity.ConversationMember{
		{
			ID:        n.NewID(),
			ContactID: n.UserID(),
			Status:    entity.ConversationMember_Owner,
		},
	}
	for _, contact := range input.Contacts {
		members = append(members, &entity.ConversationMember{
			ID:        n.NewID(),
			ContactID: contact.ID,
			Status:    entity.ConversationMember_Active,
		})
	}

	// save new conversation
	createConversation := &entity.Conversation{
		ID:      n.NewID(),
		Members: members,
		Title:   input.Title,
		Topic:   input.Topic,
	}
	if err := n.sql.Set("gorm:association_autoupdate", true).Save(&createConversation).Error; err != nil {
		return nil, errors.Wrap(err, "failed to save conversation")
	}

	// load new conversation again, to preload associations
	conversation, err := sql.ConversationByID(n.sql, createConversation.ID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to load freshly created conversation")
	}

	// Subscribe to conversation
	if err := n.networkDriver.Join(ctx, conversation.ID); err != nil {
		return nil, err
	}
	// send invite to peers
	filtered := conversation.Filtered()
	for _, member := range conversation.Members {
		if member.Contact.ID == n.UserID() {
			// skipping myself
			continue
		}
		event := n.NewContactEvent(member.Contact, p2p.Kind_ConversationInvite)
		if err := event.SetAttrs(&p2p.ConversationInviteAttrs{
			Conversation: filtered,
		}); err != nil {
			return nil, err
		}
		if err := n.EnqueueOutgoingEvent(event); err != nil {
			return nil, err
		}
	}

	return conversation, err
}

func (n *Node) ConversationAcceptInvite(_ context.Context, conversation *entity.Conversation) (*entity.Conversation, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	return nil, ErrNotImplemented
}

func (n *Node) ConversationInvite(context.Context, *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	return nil, ErrNotImplemented
}

func (n *Node) ConversationExclude(context.Context, *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	return nil, ErrNotImplemented
}

func (n *Node) ConversationList(input *node.ConversationListInput, stream node.Service_ConversationListServer) error {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	var conversations []*entity.Conversation
	if err := n.sql.Where(input.Filter).Find(&conversations).Error; err != nil {
		return errors.Wrap(err, "failed to get conversations from database")
	}

	for _, conversation := range conversations {
		if err := stream.Send(conversation); err != nil {
			return err
		}
	}
	return nil
}

func (n *Node) ConversationListPaginated(ctx context.Context, input *node.ConversationListInput) (*node.ConversationListOutput, error) {
	return nil, ErrNotImplemented
}

func (n *Node) ConversationAddMessage(_ context.Context, input *node.ConversationAddMessageInput) (*p2p.Event, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	event := n.NewConversationEvent(input.Conversation, p2p.Kind_ConversationNewMessage)
	if err := event.SetAttrs(&p2p.ConversationNewMessageAttrs{
		Message: input.Message,
	}); err != nil {
		return nil, err
	}
	if err := n.EnqueueOutgoingEvent(event); err != nil {
		return nil, err
	}
	return event, nil
}

// GetConversation implements berty.node.GetConversation
func (n *Node) GetConversation(ctx context.Context, conversation *entity.Conversation) (*entity.Conversation, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if err := n.sql.First(conversation, "ID = ?", conversation.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get conversation from database")
	}

	return conversation, nil
}

// GetConversationMember implements berty.node.GetConversationMember
func (n *Node) GetConversationMember(ctx context.Context, conversationMember *entity.ConversationMember) (*entity.ConversationMember, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	if err := n.sql.First(conversationMember, "ID = ?", conversationMember.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get conversationMember from database")
	}

	return conversationMember, nil
}

func (n *Node) DebugPing(ctx context.Context, input *node.PingDestination) (*node.Void, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	err := n.networkDriver.PingOtherNode(ctx, input.Destination)

	return &node.Void{}, err
}
