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

	defer n.handleMutex(ctx)()

	return n.conversationCreate(ctx, input)
}

func (n *Node) conversationCreate(ctx context.Context, input *node.ConversationCreateInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	var err error
	query := n.sql(ctx)
	contacts := []*entity.Contact{}
	for i, contact := range input.Contacts {
		if contact.ID == "" {
			return nil, errors.New("contact must have an ID")
		}
		if i == 0 {
			query = query.Where(&entity.Contact{ID: contact.ID})
			continue
		}
		query = query.Or(&entity.Contact{ID: contact.ID})
	}
	query = query.Or(&entity.Contact{ID: n.UserID()})
	if err := query.Find(&contacts).Error; err != nil {
		return nil, err
	}

	var conversation *entity.Conversation
	switch input.Kind {
	case entity.Conversation_OneToOne:
		if len(contacts) != 2 {
			return nil, errors.New("one to one conversation need only two contacts")
		}
		conversation, err = entity.NewOneToOneConversation(contacts[0], contacts[1])
		if err != nil {
			return nil, err
		}

	case entity.Conversation_Group:
		conversation, err = entity.NewGroupConversation(contacts)
		if err != nil {
			return nil, err
		}

	default:
		return nil, errors.New("conversation kind is not defined")
	}

	if err := bsql.ConversationSave(n.sql(ctx), conversation); err != nil {
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

	defer n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationInvite(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()
	var err error

	// find conversation
	c := &entity.Conversation{ID: input.Conversation.ID}
	if err := n.sql(ctx).First(c).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	// find interactive member (current node user)
	cm, err := c.GetInteractiveMember(n.UserID())
	if err != nil {
		return nil, err
	}

	// find contacts
	contacts := []*entity.Contact{}
	for _, contact := range input.Contacts {
		if err := n.sql(ctx).First(contact, &entity.Contact{ID: contact.ID}).Error; err != nil {
			return nil, bsql.GenericError(err)
		}
		contacts = append(contacts, contact)
	}
	if len(contacts) == 0 {
		return nil, errors.New("contacts not found")
	}

	// invite contacts
	for _, contact := range contacts {
		if err := cm.Invite(contact); err != nil {
			return nil, err
		}
	}

	// save conversation
	err = bsql.ConversationSave(n.sql(ctx), c)
	if err != nil {
		return nil, err
	}

	events := []*entity.Event{}
	event := n.NewEvent(ctx).
		SetToConversation(c).
		SetConversationInviteAttrs(&entity.ConversationInviteAttrs{
			Conversation: c,
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

	return c, nil
}

func (n *Node) ConversationExclude(ctx context.Context, input *node.ConversationManageMembersInput) (*entity.Conversation, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	return nil, errorcodes.ErrUnimplemented.New()
}

func (n *Node) ConversationList(input *node.ConversationListInput, stream node.Service_ConversationListServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	defer n.handleMutex(ctx)()

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
	var err error

	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)

	// get conversation
	conversation := &entity.Conversation{ID: input.Conversation.ID}
	if err = sql.Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return nil, err
	}

	// get interactive member (current user)
	im, err := conversation.GetInteractiveMember(n.UserID())
	if err != nil {
		return nil, err
	}

	// member write new message
	if err = im.Write(input.Message); err != nil {
		return nil, err
	}

	// save conversation
	if err = bsql.ConversationSave(sql, conversation); err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

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

	defer n.handleMutex(ctx)()

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

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)
	output := &entity.ConversationMember{}
	if err := sql.Where(input).First(output).Error; err != nil {
		return nil, bsql.GenericError(err)
	}

	return output, nil
}

func (n *Node) ConversationUpdate(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	var err error

	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)

	// get conversation
	conversation := &entity.Conversation{ID: input.ID}
	if err = sql.Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return nil, err
	}

	// get interactive member (current user)
	im, err := conversation.GetInteractiveMember(n.UserID())
	if err != nil {
		return nil, err
	}

	if err = im.SetTitle(input.Title); err != nil {
		return nil, err
	}

	if err = im.SetTopic(input.Topic); err != nil {
		return nil, err
	}

	// save conversation
	if err = bsql.ConversationSave(sql, conversation); err != nil {
		return nil, errors.Wrap(err, "cannot update conversation")
	}

	return input, n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetConversationUpdateAttrs(&entity.ConversationUpdateAttrs{Conversation: input}).
			SetToConversation(input))
}

func (n *Node) ConversationRead(ctx context.Context, input *entity.Conversation) (*entity.Conversation, error) {
	var err error

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)

	// get conversation
	conversation := &entity.Conversation{ID: input.ID}
	if err = sql.Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return nil, err
	}

	// get interactive member (current user)
	im, err := conversation.GetInteractiveMember(n.UserID())
	if err != nil {
		return nil, err
	}

	// member set conversation as read
	if err = im.Read(time.Now().UTC()); err != nil {
		return nil, err
	}

	// save conversation
	if err = bsql.ConversationSave(sql, conversation); err != nil {
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
