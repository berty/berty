package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	gql "berty.tech/core/api/protobuf/graphql"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	bsql "berty.tech/core/sql"
	"github.com/jinzhu/gorm"
	"github.com/opentracing/opentracing-go"
	opentracing "github.com/opentracing/opentracing-go"
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
	span, ctx := tracing.EnterFunc(stream.Context(), input)
	defer span.Finish()
	n.handleMutex(ctx)()
	sql := n.sql(ctx)

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
		return errorcodes.ErrPagination.Wrap(err)
	}

	// perform query
	var events []*p2p.Event
	if err := query.Find(&events).Error; err != nil {
		return errorcodes.ErrDb.Wrap(err)
	}

	// stream results
	for _, event := range events {
		if err := stream.Send(event); err != nil {
			return errorcodes.ErrNetStream.Wrap(err)
		}
	}
	return nil
}

func (n *Node) EventSeen(ctx context.Context, input *gql.Node) (*p2p.Event, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	event := &p2p.Event{}

	sql := n.sql(ctx)
	if err := sql.
		Model(&p2p.Event{}).
		Where(&p2p.Event{ID: input.ID}).
		UpdateColumn("seen_at", time.Now().UTC()).
		First(event).
		Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	// mark conversation as read
	if event.ConversationID != "" {
		_, err := n.ConversationRead(ctx, &gql.Node{ID: event.ConversationID})
		if err != nil {
			return nil, err
		}
	}

	return event, nil
}

func (n *Node) ConversationRead(ctx context.Context, input *gql.Node) (*entity.Conversation, error) {
	// get conversation
	conversation := &entity.Conversation{ID: input.ID}
	if err := n.sql(ctx).Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return nil, err
	}

	// check if last message has been read
	event := &p2p.Event{ConversationID: conversation.ID}
	count := 0
	n.sql(ctx).Model(event).Where(event).Order("created_at").Count(&count).Last(event)
	if count > 0 && event.SeenAt == nil {
		return conversation, nil
	}

	// set conversation as read
	conversation.ReadAt = time.Now().UTC()
	if err := n.sql(ctx).Save(conversation).Error; err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

	return conversation, nil
}

// GetEvent implements berty.node.GetEvent
func (n *Node) GetEvent(ctx context.Context, input *gql.Node) (*p2p.Event, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	event := &p2p.Event{}
	if err := sql.Where(input).First(event).Error; err != nil {
		return nil, errorcodes.ErrDbNothingFound.Wrap(err)
	}

	return event, nil
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(ctx context.Context, input *entity.Contact) (*entity.Contact, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	// input validation
	if err := input.Validate(); err != nil {
		return nil, errorcodes.ErrValidation.Wrap(err)
	}
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, input)
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// mark contact as friend
	contact.Status = entity.Contact_IsFriend
	if err := sql.Save(contact).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// send ContactRequestAccepted event
	event := n.NewContactEvent(ctx, contact, p2p.Kind_ContactRequestAccepted)

	if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
		return nil, err
	}

	// send ContactShareMe event
	if err := n.contactShareMe(ctx, contact); err != nil {
		return nil, err
	}

	return contact, nil
}

// ContactRequest implements berty.node.ContactRequest
func (n *Node) ContactRequest(ctx context.Context, req *node.ContactRequestInput) (*entity.Contact, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, req)
	defer span.Finish()
	n.handleMutex(ctx)()

	// input validation
	if err := req.Contact.Validate(); err != nil {
		return nil, errorcodes.ErrValidation.Wrap(err)
	}

	// check for duplicate
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, req.Contact)

	if errors.Cause(err) == gorm.ErrRecordNotFound {
		// save contact in database
		contact = req.Contact
		contact.Status = entity.Contact_IsRequested
		if err = sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
			return nil, errorcodes.ErrDbCreate.Wrap(err)
		}
	} else if err != nil {
		return nil, err

	} else if contact.Status == entity.Contact_RequestedMe {
		logger().Info("this contact has already asked us, accepting the request")
		return n.ContactAcceptRequest(ctx, contact)

	} else if contact.Status == entity.Contact_IsRequested {
		logger().Info("contact has already been requested, sending event again")

	} else if contact.Status == entity.Contact_Myself {
		return nil, errorcodes.ErrContactReqMyself.New()

	} else {
		return nil, errorcodes.ErrContactReqExisting.New()
	}

	// send request to peer
	event := n.NewContactEvent(ctx, contact, p2p.Kind_ContactRequest)
	if err := event.SetAttrs(&p2p.ContactRequestAttrs{
		Me: &entity.Contact{
			ID:          n.UserID(),
			DisplayName: n.config.Myself.DisplayName,
		},
		IntroText: req.IntroText,
	}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}

	return contact, nil
}

// ContactUpdate implements berty.node.ContactUpdate
func (n *Node) ContactUpdate(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, contact)
	defer span.Finish()
	n.handleMutex(ctx)()

	// input validation
	if contact == nil || contact.ID == "" {
		return nil, errorcodes.ErrValidation.New()
	}
	if err := contact.Validate(); err != nil {
		return nil, errorcodes.ErrValidation.Wrap(err)
	}

	// FIXME: protect import fields from updating

	sql := n.sql(ctx)

	if err := sql.Model(contact).Update("displayName", contact.DisplayName).Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	return contact, nil
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, contact)
	defer span.Finish()
	n.handleMutex(ctx)()

	// input validation
	if contact == nil || contact.ID == "" {
		return nil, errorcodes.ErrValidation.New()
	}

	if err := contact.Validate(); err != nil {
		return nil, errorcodes.ErrValidation.Wrap(err)
	}

	if contact.ID == n.config.Myself.ID {
		return nil, errorcodes.ErrValidationMyself.New()
	}

	// remove from sql
	sql := n.sql(ctx)
	err := sql.Delete(contact).Error

	if err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	return contact, nil
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(input *node.ContactListInput, stream node.Service_ContactListServer) error {
	span, ctx := tracing.EnterFunc(stream.Context(), input)
	defer span.Finish()
	n.handleMutex(ctx)()

	sql := n.sql(ctx)

	// prepare query
	query := sql.Model(entity.Contact{}).Where(input.Filter)

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errorcodes.ErrPagination.Wrap(err)
	}

	// perform query
	var contacts []*entity.Contact
	if err := query.Find(&contacts).Error; err != nil {
		return errorcodes.ErrDb.Wrap(err)
	}

	// stream results
	for _, contact := range contacts {
		if err := stream.Send(contact); err != nil {
			return errorcodes.ErrNetStream.Wrap(err)
		}
	}
	return nil
}

// Contact implements berty.node.Contact
func (n *Node) Contact(ctx context.Context, input *node.ContactInput) (*entity.Contact, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	contact := &entity.Contact{}
	if err := sql.Where(input).First(input).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return input, nil
}

//
// Conversation
//

func (n *Node) ConversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	return n.conversationCreate(ctx, input)
}

func (n *Node) conversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()

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
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	// load new conversation again, to preload associations
	conversation, err := bsql.ConversationByID(sql, createConversation.ID)
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// Async subscribe to conversation
	// wait for 1s to simulate a sync subscription,
	// if too long, the task will be done in background
	done := make(chan bool, 1)
	go func() {
		if err := n.networkDriver.Join(ctx, conversation.ID); err != nil {
			n.LogBackgroundWarn(ctx, errors.Wrap(err, "failed to join conversation"))
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
		event := n.NewContactEvent(ctx, member.Contact, p2p.Kind_ConversationInvite)
		if err := event.SetAttrs(&p2p.ConversationInviteAttrs{
			Conversation: filtered,
		}); err != nil {
			return nil, errorcodes.ErrUndefined.Wrap(err)
		}
		if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
			return nil, err
		}
	}

	return conversation, nil
}

func (n *Node) ConversationAcceptInvite(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationInvite(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationExclude(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationList(input *node.ConversationListInput, stream node.Service_ConversationListServer) error {
	span, ctx := tracing.EnterFunc(stream.Context(), input)
	defer span.Finish()
	n.handleMutex(ctx)()

	// prepare query
	sql := n.sql(ctx)
	query := sql.Model(entity.Conversation{}).Where(input.Filter)

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errorcodes.ErrPagination.Wrap(err)
	}

	// perform query
	var conversations []*entity.Conversation
	if err := query.Find(&conversations).Error; err != nil {
		return errorcodes.ErrDb.Wrap(err)
	}

	// stream results
	for _, conversation := range conversations {
		if err := stream.Send(conversation); err != nil {
			return errorcodes.ErrNet.Wrap(err)
		}
	}
	return nil
}

func (n *Node) ConversationAddMessage(ctx context.Context, input *node.ConversationAddMessageInput) (*p2p.Event, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	event := n.NewConversationEvent(ctx, input.Conversation, p2p.Kind_ConversationNewMessage)
	if err := event.SetAttrs(&p2p.ConversationNewMessageAttrs{
		Message: input.Message,
	}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}
	return event, nil
}

// GetConversation implements berty.node.GetConversation
func (n *Node) GetConversation(ctx context.Context, input *gql.Node) (*entity.Conversation, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	conversation := &entity.Conversation{}
	if err := sql.Where(input).First(conversation).Error; err != nil {
		return nil, errorcodes.ErrDbNothingFound.Wrap(err)
	}

	return conversation, nil
}

// GetConversationMember implements berty.node.GetConversationMember
func (n *Node) GetConversationMember(ctx context.Context, input *gql.Node) (*entity.ConversationMember, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	conversationMember := &entity.ConversationMember{}
	if err := sql.Where(input).First(conversationMember).Error; err != nil {
		return nil, errorcodes.ErrDbNothingFound.Wrap(err)
	}

	return conversationMember, nil
}

func (n *Node) DebugPing(ctx context.Context, input *node.PingDestination) (*node.Void, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	n.handleMutex(ctx)()

	err := n.networkDriver.PingOtherNode(ctx, input.Destination)

	return &node.Void{}, errorcodes.ErrNet.Wrap(err)
}
