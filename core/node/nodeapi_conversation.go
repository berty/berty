package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	bsql "berty.tech/core/sql"
	"github.com/pkg/errors"
)

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

	conversation, err := bsql.SaveConversation(n.sql(ctx), createConversation, createConversation.ID)
	if err != nil {
		return nil, err
	}

	// send invite to peers
	filtered := conversation.Filtered()
	for _, member := range conversation.Members {
		if member.Contact.ID == n.UserID() {
			// skipping myself
			continue
		}
		if err := n.EnqueueOutgoingEvent(ctx,
			n.NewEvent(ctx).
				SetToContact(member.Contact).
				SetConversationInviteAttrs(&entity.ConversationInviteAttrs{
					Conversation: filtered,
				}),
		); err != nil {
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

	conversation := &entity.Conversation{ID: input.Conversation.ID}
	if err := n.sql(ctx).First(&conversation, &entity.Conversation{ID: input.Conversation.ID}).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	addedMembers := []*entity.ConversationMember{}

	for _, contact := range input.Contacts {
		if err := n.sql(ctx).First(&contact, &entity.Contact{ID: contact.ID}).Error; err != nil {
			return nil, bsql.GenericError(err)
		}

		member := &entity.ConversationMember{}
		if err := n.sql(ctx).First(&member, &entity.ConversationMember{ContactID: contact.ID, ConversationID: conversation.ID}).Error; err != nil {
			if errorcodes.ErrDbNothingFound.Is(bsql.GenericError(err)) || member.ID == "" {
				member = &entity.ConversationMember{
					ID:             n.NewID(),
					ContactID:      contact.ID,
					ConversationID: conversation.ID,
					Status:         entity.ConversationMember_Active,
				}

				addedMembers = append(addedMembers, member)
			}

			if member.Status != entity.ConversationMember_Active {
				// TODO: remove existing member from convo
				member.Status = entity.ConversationMember_Active
				addedMembers = append(addedMembers, member)
			}
		}
	}

	events := []*entity.Event{}

	for _, member := range addedMembers {
		if err := n.sql(ctx).Save(member).Error; err != nil {
			return nil, bsql.GenericError(err)
		}

		input.Conversation.Members = append(input.Conversation.Members, member)
	}

	for _, member := range addedMembers {
		event := n.NewEvent(ctx).
			SetToContact(member.Contact).
			SetConversationInviteAttrs(&entity.ConversationInviteAttrs{Conversation: conversation.Filtered()})
		if event.Err() != nil {
			return nil, errorcodes.ErrUndefined.Wrap(event.Err())
		}

		events = append(events, event)
	}

	event := n.NewEvent(ctx).
		SetToConversation(conversation).
		SetConversationUpdateAttrs(&entity.ConversationUpdateAttrs{
			Conversation: conversation,
		})
	if event.Err() != nil {
		return nil, errorcodes.ErrUndefined.Wrap(event.Err())
	}
	events = append(events, event)

	for _, event := range events {
		if err := n.EnqueueOutgoingEvent(ctx, event); err != nil {
			return nil, err
		}
	}

	return conversation, nil
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

	event := n.NewEvent(ctx)
	return event, n.EnqueueOutgoingEvent(ctx, event.
		SetToConversation(input.Conversation).
		SetConversationNewMessageAttrs(&entity.ConversationNewMessageAttrs{Message: input.Message}))
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

func (n *Node) ConversationUpdate(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	n.handleMutex(ctx)()

	sql := n.sql(ctx)

	if err := sql.Save(input).Error; err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

	return input, n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetConversationUpdateAttrs(&entity.ConversationUpdateAttrs{Conversation: input}).
			SetToConversation(input))
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
	event := &entity.Event{}
	filter := &entity.Event{
		TargetType: entity.Event_ToSpecificConversation,
		TargetAddr: conversation.ID,
		Direction:  entity.Event_Incoming,
	}
	n.sql(ctx).Model(event).Where(filter).Order("created_at").Last(event)
	if event.SeenAt == nil {
		return conversation, nil
	}

	// send conversation as read
	return conversation, n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetToConversation(conversation).
			SetConversationReadAttrs(&entity.ConversationReadAttrs{Conversation: conversation}))
}

func (n *Node) ConversationLastEvent(ctx context.Context, input *entity.Conversation) (*entity.Event, error) {
	filter := &entity.Event{
		TargetAddr: input.ID,
		TargetType: entity.Event_ToSpecificConversation,
	}
	event := &entity.Event{}

	// FIXME: add last_event_id in conversation new message handler to be sure to fetch the last event
	time.Sleep(time.Second / 3)
	if err := n.sql(ctx).Order("created_at desc").Where(filter).Last(event).Error; err != nil {
		return nil, err
	}
	return event, nil
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
