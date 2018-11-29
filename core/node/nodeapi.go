package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	bsql "berty.tech/core/sql"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
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
	sql := n.sql(stream.Context())

	// prepare query
	query := sql.Model(p2p.Event{}).Where(input.Filter)

	if input.OnlyWithoutAckedAt == node.NullableTrueFalse_True {
		query = query.Where("acked_at IS NULL")
	} else if input.OnlyWithoutAckedAt == node.NullableTrueFalse_False {
		query = query.Where("acked_at IS NOT NULL")
	}

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errors.Wrap(err, "pagination error")
	}

	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	// perform query
	var events []*p2p.Event
	if err := query.Find(&events).Error; err != nil {
		return errors.Wrap(err, "failed to get events from database")
	}

	// stream results
	for _, event := range events {
		if err := stream.Send(event); err != nil {
			return err
		}
	}
	return nil
}

func (n *Node) EventSeen(ctx context.Context, input *node.EventIDInput) (*p2p.Event, error) {
	event := &p2p.Event{}
	count := 0

	sql := n.sql(ctx)
	if err := sql.
		Model(&p2p.Event{}).
		Where(&p2p.Event{ID: input.EventID}).
		Count(&count).
		UpdateColumn("seen_at", time.Now().UTC()).
		First(event).
		Error; err != nil {
		return nil, errors.Wrap(err, "unable to mark event as seen")
	}

	if count == 0 {
		return nil, errors.New("event not found")
	}

	return event, nil
}

// GetEvent implements berty.node.GetEvent
func (n *Node) GetEvent(ctx context.Context, event *p2p.Event) (*p2p.Event, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	sql := n.sql(ctx)
	if err := sql.First(event, "ID = ?", event.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get event from database")
	}

	return event, nil
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(ctx context.Context, input *entity.Contact) (*entity.Contact, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	// input validation
	if err := input.Validate(); err != nil {
		return nil, errors.Wrap(err, ErrInvalidInput.Error())
	}
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, input)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get contact")
	}

	// mark contact as friend
	contact.Status = entity.Contact_IsFriend
	if err := sql.Save(contact).Error; err != nil {
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
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, req.Contact)
	if err != nil {
		// save contact in database
		contact = req.Contact
		contact.Status = entity.Contact_IsRequested
		if err = sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
			return nil, errors.Wrap(err, "failed to save contact")
		}
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
func (n *Node) ContactUpdate(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
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

	sql := n.sql(ctx)
	return contact, sql.Model(contact).Update("displayName", contact.DisplayName).Error
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
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
	sql := n.sql(ctx)
	return contact, sql.Delete(contact).Error
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(input *node.ContactListInput, stream node.Service_ContactListServer) error {
	sql := n.sql(stream.Context())

	// prepare query
	query := sql.Model(entity.Contact{}).Where(input.Filter)

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errors.Wrap(err, "pagination error")
	}

	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	// perform query
	var contacts []*entity.Contact
	if err := query.Find(&contacts).Error; err != nil {
		return errors.Wrap(err, "failed to get contacts from database")
	}

	// stream results
	for _, contact := range contacts {
		if err := stream.Send(contact); err != nil {
			return err
		}
	}
	return nil
}

// GetContact implements berty.node.GetContact
func (n *Node) GetContact(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	sql := n.sql(ctx)
	if err := sql.First(contact, "ID = ?", contact.ID).Error; err != nil {
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

	return n.conversationCreate(ctx, input)
}

func (n *Node) conversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
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
	sql := n.sql(ctx)

	if err := sql.Set("gorm:association_autoupdate", true).Save(&createConversation).Error; err != nil {
		return nil, errors.Wrap(err, "failed to save conversation")
	}

	// load new conversation again, to preload associations
	conversation, err := bsql.ConversationByID(sql, createConversation.ID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to load freshly created conversation")
	}

	// Async subscribe to conversation
	// wait for 1s to simulate a sync subscription,
	// if too long, the task will be done in background
	done := make(chan bool, 1)
	go func() {
		if err := n.networkDriver.Join(ctx, conversation.ID); err != nil {
			n.LogBackgroundWarn(errors.Wrap(err, "failed to join conversation"))
		}
		done <- true
	}()
	select {
	case <-done:
	case <-time.After(1 * time.Second):
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
	// prepare query
	sql := n.sql(stream.Context())
	query := sql.Model(entity.Conversation{}).Where(input.Filter)

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errors.Wrap(err, "pagination error")
	}

	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	// perform query
	var conversations []*entity.Conversation
	if err := query.Find(&conversations).Error; err != nil {
		return errors.Wrap(err, "failed to get conversations from database")
	}

	// stream results
	for _, conversation := range conversations {
		if err := stream.Send(conversation); err != nil {
			return err
		}
	}
	return nil
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

	sql := n.sql(ctx)
	if err := sql.First(conversation, "ID = ?", conversation.ID).Error; err != nil {
		return nil, errors.Wrap(err, "failed to get conversation from database")
	}

	return conversation, nil
}

// GetConversationMember implements berty.node.GetConversationMember
func (n *Node) GetConversationMember(ctx context.Context, conversationMember *entity.ConversationMember) (*entity.ConversationMember, error) {
	n.handleMutex.Lock()
	defer n.handleMutex.Unlock()

	sql := n.sql(ctx)
	if err := sql.First(conversationMember, "ID = ?", conversationMember.ID).Error; err != nil {
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
