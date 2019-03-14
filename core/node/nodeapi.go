package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	bsql "berty.tech/core/sql"
	"github.com/jinzhu/gorm"
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
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	n.handleMutex(ctx)()
	sql := n.sql(ctx)

	// prepare query
	query := sql.Model(entity.Event{}).Where(input.Filter)

	if input.OnlyWithoutAckedAt == node.NullableTrueFalse_True {
		query = query.Where("acked_at IS NULL")
	} else if input.OnlyWithoutAckedAt == node.NullableTrueFalse_False {
		query = query.Where("acked_at IS NOT NULL")
	}

	if input.OnlyWithoutSeenAt == node.NullableTrueFalse_True {
		query = query.Where("seen_at IS NULL")
	} else if input.OnlyWithoutSeenAt == node.NullableTrueFalse_False {
		query = query.Where("seen_at IS NOT NULL")
	}

	// pagination
	var err error
	query, err = paginate(query, input.Paginate)
	if err != nil {
		return errorcodes.ErrPagination.Wrap(err)
	}

	// perform query
	var events []*entity.Event
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

func (n *Node) EventSeen(ctx context.Context, input *entity.Event) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	event := &entity.Event{}

	sql := n.sql(ctx)

	// get event
	if err := sql.
		Model(&entity.Event{}).
		Where(&entity.Event{ID: input.ID}).
		First(event).
		Error; err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	// check if event is from another contact
	if event.Direction != entity.Event_Incoming {
		return event, nil
	}

	seenAt := time.Now().UTC()
	event.SeenAt = &seenAt

	// then mark as seen
	if err := sql.Save(event).Error; err != nil {
		return nil, errors.Wrap(err, "cannot set event as seen")
	}

	// mark conversation as read
	if event.ConversationID != "" {
		_, err := n.ConversationRead(ctx, &entity.Conversation{ID: event.ConversationID})
		if err != nil {
			return nil, err
		}
	}

	return event, nil
}

func (n *Node) ConversationUpdate(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)

	if err := sql.Save(input).Error; err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

	// event
	event := n.NewConversationEvent(ctx, input, entity.Kind_ConversationUpdate)
	if err := event.SetAttrs(&entity.ConversationUpdateAttrs{
		Conversation: input,
	}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}
	return input, nil
}

func (n *Node) ConversationRead(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	var err error

	// get conversation
	conversation := &entity.Conversation{ID: input.ID}
	if err = n.sql(ctx).Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return nil, err
	}

	// set conversation as read
	conversation.ReadAt = time.Now().UTC()
	if err = n.sql(ctx).Save(conversation).Error; err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

	// check if last message has been read
	event := &entity.Event{ConversationID: conversation.ID, Direction: entity.Event_Incoming}
	n.sql(ctx).Model(event).Where(event).Order("created_at").Last(event)
	if event.SeenAt == nil {
		return conversation, nil
	}

	// send conversation as read
	event = n.NewConversationEvent(ctx, conversation, entity.Kind_ConversationRead)
	if err = event.SetConversationReadAttrs(&entity.ConversationReadAttrs{Conversation: conversation}); err != nil {
		return nil, err
	}
	if err = n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
		return nil, err
	}
	return conversation, nil
}

func (n *Node) ConversationLastEvent(ctx context.Context, input *entity.Conversation) (*entity.Event, error) {
	output := &entity.Event{ConversationID: input.ID}

	// FIXME: add last_event_id in conversation new message handler to be sure to fetch the last event
	time.Sleep(time.Second / 3)
	if err := n.sql(ctx).Order("created_at desc").Where(output).Last(output).Error; err != nil {
		return nil, err
	}
	return output, nil
}

func (n *Node) ConversationRemove(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	var err error

	// get conversation
	if err = n.sql(ctx).First(input).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	// remove conversation
	sql := n.sql(ctx)
	if err = sql.
		Where(&entity.ConversationMember{ConversationID: input.ID}).
		Delete(&entity.ConversationMember{}).Error; err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	if err = sql.Delete(input).Error; err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	return input, nil
}

// GetEvent implements berty.node.GetEvent
func (n *Node) GetEvent(ctx context.Context, input *entity.Event) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	event := &entity.Event{}
	if err := sql.Where(input).First(event).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	return event, nil
}

//
// contacts
//

// ContactAcceptRequest implements berty.node.ContactAcceptRequest
func (n *Node) ContactAcceptRequest(ctx context.Context, input *node.ContactAcceptRequestInput) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	// input validation
	if err := input.Validate(); err != nil {
		return nil, err
	}
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, input.ToContact())
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// mark contact as friend
	contact.Status = entity.Contact_IsFriend
	if err := sql.Save(contact).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	// send ContactRequestAccepted event
	event := n.NewContactEvent(ctx, contact, entity.Kind_ContactRequestAccepted)
	if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
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
	tracer := tracing.EnterFunc(ctx, req)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	// input validation
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// check for duplicate
	sql := n.sql(ctx)
	contact, err := bsql.FindContact(sql, req.ToContact())

	if errors.Cause(err) == gorm.ErrRecordNotFound {
		// save contact in database
		contact = req.ToContact()
		contact.Status = entity.Contact_IsRequested
		if err = sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
			return nil, errorcodes.ErrDbCreate.Wrap(err)
		}
	} else if err != nil {
		return nil, err

	} else if contact.Status == entity.Contact_RequestedMe {
		logger().Info("this contact has already asked us, accepting the request")
		return n.ContactAcceptRequest(ctx, &node.ContactAcceptRequestInput{
			ContactID: contact.ID,
		})

	} else if contact.Status == entity.Contact_IsRequested {
		logger().Info("contact has already been requested, sending event again")

	} else if contact.Status == entity.Contact_Myself {
		return nil, errorcodes.ErrContactReqMyself.New()

	} else {
		return nil, errorcodes.ErrContactReqExisting.New()
	}

	// send request to peer
	event := n.NewContactEvent(ctx, contact, entity.Kind_ContactRequest)
	if err := event.SetAttrs(&entity.ContactRequestAttrs{
		Me:        n.config.Myself.Filtered().WithPushInformation(n.sql(ctx)),
		IntroText: req.IntroText,
	}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}

	// create conversation if doesn't exist
	if _, err := n.ConversationCreate(ctx, &node.ConversationCreateInput{Contacts: []*entity.Contact{contact}}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	return contact, nil
}

// ContactUpdate implements berty.node.ContactUpdate
func (n *Node) ContactUpdate(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, contact)
	defer tracer.Finish()
	ctx = tracer.Context()

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

	if contact.ID == n.config.Myself.ID {
		if err := n.sql(ctx).Where(&entity.Contact{ID: contact.ID}).First(&n.config.Myself).Error; err != nil {
			return nil, errorcodes.ErrDb.Wrap(err)
		}

		evt := n.NewContactEvent(ctx, n.config.Myself, entity.Kind_ContactShareMe)
		if err := evt.SetAttrs(&entity.ContactShareMeAttrs{Me: n.config.Myself.Filtered().WithPushInformation(n.sql(ctx))}); err != nil {
			return nil, err
		}

		if err := n.BroadcastEventToContacts(ctx, evt); err != nil {
			return nil, err
		}
	}

	return contact, nil
}

// ContactRemove implements berty.node.ContactRemove
func (n *Node) ContactRemove(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, contact)
	defer tracer.Finish()
	ctx = tracer.Context()

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
	if err := sql.Where(&entity.Device{ContactID: contact.ID}).Delete(&entity.Device{}).Error; err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	err := sql.Delete(contact).Error
	if err != nil {
		return nil, errorcodes.ErrDbDelete.Wrap(err)
	}

	// remove 1-1 conversation
	// don't return error if not found
	conversation, err := bsql.ConversationOneToOne(sql, n.config.Myself.ID, contact.ID)
	switch {
	case err == nil: // conversation exists, delete it
		n.ConversationRemove(ctx, &entity.Conversation{ID: conversation.ID})
	case gorm.IsRecordNotFoundError(errors.Cause(err)): // conversation is not found, do nothing
	case err != nil: // another error is triggered, returning it
		return nil, err
	}

	return contact, nil
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(input *node.ContactListInput, stream node.Service_ContactListServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

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
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	output := &entity.Contact{}
	if err := sql.Where(input.Filter).First(output).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return output, nil
}

func (n *Node) ContactCheckPublicKey(ctx context.Context, input *node.ContactInput) (*node.Bool, error) {
	err := input.Filter.Validate()

	return &node.Bool{Ret: err == nil}, err
}

//
// Conversation
//

func (n *Node) ConversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	return n.conversationCreate(ctx, input)
}

func (n *Node) conversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

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

	conversation, err := bsql.CreateConversation(n.sql(ctx), createConversation)
	if err != nil {
		return nil, err
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
		event := n.NewContactEvent(ctx, member.Contact, entity.Kind_ConversationInvite)
		event.ConversationID = conversation.ID
		if err := event.SetAttrs(&entity.ConversationInviteAttrs{
			Conversation: filtered,
		}); err != nil {
			return nil, errorcodes.ErrUndefined.Wrap(err)
		}
		if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
			return nil, err
		}
	}

	return conversation, nil
}

func (n *Node) ConversationAcceptInvite(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationInvite(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationExclude(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationList(input *node.ConversationListInput, stream node.Service_ConversationListServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

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

func (n *Node) ConversationAddMessage(ctx context.Context, input *node.ConversationAddMessageInput) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	event := n.NewConversationEvent(ctx, input.Conversation, entity.Kind_ConversationNewMessage)
	if err := event.SetAttrs(&entity.ConversationNewMessageAttrs{
		Message: input.Message,
	}); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	if err := n.EnqueueOutgoingEvent(ctx, event, &OutgoingEventOptions{}); err != nil {
		return nil, errorcodes.ErrNet.Wrap(err)
	}
	return event, nil
}

// GetConversation implements berty.node.GetConversation
func (n *Node) Conversation(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	output := &entity.Conversation{}
	if err := sql.Where(input).First(output).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	return output, nil
}

// GetConversationMember implements berty.node.GetConversationMember
func (n *Node) ConversationMember(ctx context.Context, input *entity.ConversationMember) (*entity.ConversationMember, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)
	output := &entity.ConversationMember{}
	if err := sql.Where(input).First(output).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	return output, nil
}

func (n *Node) DebugPing(ctx context.Context, input *node.PingDestination) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	err := n.networkDriver.PingOtherNode(ctx, input.Destination)

	return &node.Void{}, errorcodes.ErrNet.Wrap(err)
}
