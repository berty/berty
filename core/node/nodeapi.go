package node

import (
	"context"
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	bsql "berty.tech/core/sql"
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

	defer n.handleMutex(ctx)()
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

func (n *Node) EventUnseen(input *node.EventListInput, stream node.Service_EventUnseenServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	defer n.handleMutex(ctx)()
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

func (n *Node) EventRetry(ctx context.Context, input *entity.Event) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)

	// get event
	event, err := entity.GetEventByID(sql, input.ID)
	if err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	dispatches, err := entity.FindDispatchForEvent(sql, event)
	if err != nil {
		return nil, err
	}

	for _, dispatch := range dispatches {
		if dispatch.ContactID != n.config.Myself.ID {
			dispatch.RetryBackoff = 0
			dispatch.SendErrorMessage = ""
			dispatch.SendErrorDetail = ""
			if err := sql.Save(dispatch).Error; err != nil {
				n.LogBackgroundError(ctx, errors.Wrap(bsql.GenericError(err), "error while updating RetryBackoff on event dispatch"))
				continue
			}
			go func(dispatch *entity.EventDispatch) {
				n.outgoingEvents <- dispatch
			}(dispatch)
		}
	}
	event.Dispatches = dispatches

	return event, nil
}

func (n *Node) EventSeen(ctx context.Context, input *entity.Event) (*node.Void, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	return n.eventSeen(ctx, input)
}

func (n *Node) eventSeen(ctx context.Context, input *entity.Event) (*node.Void, error) {
	sql := n.sql(ctx)

	// find events
	events := []*entity.Event{}
	err := sql.Where(input).Find(&events).Error
	if err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	// set same type of event as seen
	var errLoop error
	seenAt := time.Now().UTC()
	for _, e := range events {
		e.SeenAt = &seenAt
		if err := sql.Save(e).Error; err != nil {
			errLoop = errors.Wrap(
				errLoop,
				fmt.Sprintf("cannot set event as seen"),
			)
		}
	}
	if errLoop != nil {
		return nil, errLoop
	}

	_ = n.updateAppBadge(ctx)

	return &node.Void{}, nil
}

// GetEvent implements berty.node.GetEvent
func (n *Node) GetEvent(ctx context.Context, input *entity.Event) (*entity.Event, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

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

	defer n.handleMutex(ctx)()
	return n.contactAcceptRequest(ctx, input)
}

func (n *Node) contactAcceptRequest(ctx context.Context, input *node.ContactAcceptRequestInput) (*entity.Contact, error) {
	// input validation
	if err := input.Validate(); err != nil {
		return nil, err
	}

	sql := n.sql(ctx)

	contact, err := bsql.FindContact(sql, input.ToContact())
	if err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	if err := contact.Accepted(time.Now()); err != nil {
		return nil, err
	}

	if err = bsql.ContactSave(sql, contact); err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	// send ContactRequestAccepted event

	if err := n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).SetToContact(contact).SetContactRequestAcceptedAttrs(nil),
	); err != nil {
		return nil, err
	}

	// send ContactShareMe event
	if err := n.contactShareMe(ctx, contact); err != nil {
		return nil, err
	}

	_ = n.updateAppBadge(ctx)

	return contact, nil
}

// ContactRequest implements berty.node.ContactRequest
func (n *Node) ContactRequest(ctx context.Context, req *node.ContactRequestInput) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, req)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	// input validation
	if err := req.Validate(); err != nil {
		return nil, err
	}

	// check for duplicate
	sql := n.sql(ctx)

	contact, err := bsql.ContactByID(sql, req.ContactID)

	if errors.Cause(err) == gorm.ErrRecordNotFound {
		// save contact in database
		contact, err = entity.NewContact(
			req.ContactID,
			req.ContactOverrideDisplayName,
			entity.Contact_Unknown,
		)
		if err != nil {
			return nil, err
		}
	}

	if err := contact.Requested(time.Now()); err != nil {
		return nil, err
	}

	if err = bsql.ContactSave(sql, contact); err != nil {
		return nil, errorcodes.ErrDbCreate.Wrap(err)
	}

	// send request to peer
	if err := n.EnqueueOutgoingEvent(ctx,
		n.NewEvent(ctx).
			SetToContact(contact).
			SetContactRequestAttrs(&entity.ContactRequestAttrs{
				Me:        n.config.Myself.Filtered().WithPushInformation(n.sql(ctx)),
				IntroText: req.IntroText,
			}),
	); err != nil {
		return nil, err
	}

	// create conversation if doesn't exist
	if _, err := n.conversationCreate(ctx,
		&node.ConversationCreateInput{
			Contacts: []*entity.Contact{contact},
			Kind:     entity.Conversation_OneToOne,
		},
	); err != nil {
		return nil, errorcodes.ErrUndefined.Wrap(err)
	}
	return contact, nil
}

func (n *Node) ContactSeen(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	var err error

	tracer := tracing.EnterFunc(ctx, contact)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)

	contact, err = bsql.ContactByID(sql, contact.ID)
	if err != nil {
		return nil, err
	}

	if err := contact.Seen(time.Now()); err != nil {
		return nil, err
	}

	if err = bsql.ContactSave(sql, contact); err != nil {
		return nil, errorcodes.ErrDbUpdate.Wrap(err)
	}

	return contact, nil
}

// ContactUpdate implements berty.node.ContactUpdate
func (n *Node) ContactUpdate(ctx context.Context, contact *entity.Contact) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, contact)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

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
		// FIXME: replace with a unique Broadcast/ToAllContact event
		if err := n.sql(ctx).Where(&entity.Contact{ID: contact.ID}).First(&n.config.Myself).Error; err != nil {
			return nil, errorcodes.ErrDb.Wrap(err)
		}

		evt := n.NewEvent(ctx).
			SetToAllContacts().
			SetContactShareMeAttrs(&entity.ContactShareMeAttrs{
				Me: n.config.Myself.Filtered().WithPushInformation(n.sql(ctx)),
			})
		if err := evt.Err(); err != nil {
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

	defer n.handleMutex(ctx)()

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

	// remove one to one conversation
	_, err = n.conversationRemove(ctx, &entity.Conversation{ID: entity.GetOneToOneID(n.config.Myself, contact)})
	if err != nil {
		// @TODO: log an error when issue #1325 will be done
		logger().Warn(err.Error())
	}

	_ = n.updateAppBadge(ctx)

	return contact, nil
}

// ContactList implements berty.node.ContactList
func (n *Node) ContactList(input *node.ContactListInput, stream node.Service_ContactListServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	defer n.handleMutex(ctx)()

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
func (n *Node) Contact(ctx context.Context, input *entity.Contact) (*entity.Contact, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.handleMutex(ctx)()

	sql := n.sql(ctx)
	output := &entity.Contact{}
	if err := sql.Where(&entity.Contact{
		ID:     input.ID,
		Status: input.Status,
	}).First(output).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return output, nil
}

func (n *Node) ContactCheckPublicKey(ctx context.Context, input *entity.Contact) (*node.Bool, error) {
	err := input.Validate()

	return &node.Bool{Ret: err == nil}, err
}

func (n *Node) DebugPing(ctx context.Context, input *node.PingDestination) (*node.Void, error) {
	// tracer := tracing.EnterFunc(ctx, input)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	// defer n.handleMutex(ctx)()

	// err := n.networkDriver.PingOtherNode(ctx, input.Destination)

	return &node.Void{}, errorcodes.ErrNet.Wrap(fmt.Errorf("not implemented"))
}
