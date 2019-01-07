package node

import (
	"context"
	"fmt"
	"time"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/notification"
	bsql "berty.tech/core/sql"
	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type EventHandler func(context.Context, *p2p.Event) error

//
// Contact handlers
//

func (n *Node) handleContactRequest(ctx context.Context, input *p2p.Event) error {
	attrs, err := input.GetContactRequestAttrs()
	if err != nil {
		return err
	}
	// FIXME: validate input

	sql := n.sql(ctx)
	_, err = bsql.FindContact(sql, &entity.Contact{ID: attrs.Me.ID})
	if err == nil {
		return errorcodes.ErrContactReqExisting.New()
	}

	// save requester in db
	requester := attrs.Me
	requester.Status = entity.Contact_RequestedMe
	requester.Devices = []*entity.Device{
		{
			ID: input.SenderID,
			//Key: crypto.NewPublicKey(p2p.GetPubkey(ctx)),
		},
	}
	if err := sql.Set("gorm:association_autoupdate", true).Save(requester).Error; err != nil {
		return err
	}

	n.DisplayNotification(notification.Payload{
		Title: "Contact request",
		Body:  attrs.Me.DisplayName + " wants to add you",
	})
	// nothing more to do, now we wait for the UI to accept the request
	return nil
}

func (n *Node) handleContactRequestAccepted(ctx context.Context, input *p2p.Event) error {
	// fetching existing contact from db
	sql := n.sql(ctx)
	contact, err := bsql.ContactByID(sql, input.SenderID)
	if err != nil {
		return errorcodes.ErrDbNothingFound.Wrap(err)
	}

	contact.Status = entity.Contact_IsFriend
	//contact.Devices[0].Key = crypto.NewPublicKey(p2p.GetPubkey(ctx))
	if err := sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
		return err
	}

	// send my contact
	if err := n.contactShareMe(ctx, contact); err != nil {
		return err
	}

	if err := n.networkDriver.Join(ctx, input.SenderID); err != nil {
		return err
	}

	n.DisplayNotification(notification.Payload{
		Title: "Contact request accepted",
		Body:  contact.DisplayName + " accepted your request",
	})
	return nil
}

func (n *Node) handleContactShareMe(ctx context.Context, input *p2p.Event) error {
	attrs, err := input.GetContactShareMeAttrs()
	if err != nil {
		return err
	}

	// fetching existing contact from db
	sql := n.sql(ctx)
	contact, err := bsql.ContactByID(sql, input.SenderID)
	if err != nil {
		return errorcodes.ErrDbNothingFound.Wrap(err)
	}

	// FIXME: UI: ask for confirmation before update
	contact.DisplayName = attrs.Me.DisplayName
	contact.DisplayStatus = attrs.Me.DisplayStatus
	// FIXME: save more attributes
	return sql.Save(contact).Error
}

//
// Conversation handlers
//

func (n *Node) handleConversationInvite(ctx context.Context, input *p2p.Event) error {
	attrs, err := input.GetConversationInviteAttrs()
	if err != nil {
		return err
	}

	members := []*entity.ConversationMember{}
	for _, member := range attrs.Conversation.Members {
		members = append(members, &entity.ConversationMember{
			ID:        member.ID,
			ContactID: member.Contact.ID,
			Status:    member.Status,
		})
	}
	conversation := &entity.Conversation{
		Members: members,
		ID:      attrs.Conversation.ID,
		Title:   attrs.Conversation.Title,
		Topic:   attrs.Conversation.Topic,
	}

	if _, err := bsql.CreateConversation(n.sql(ctx), conversation); err != nil {
		return err
	}

	if err := n.networkDriver.Join(ctx, attrs.Conversation.ID); err != nil {
		return err
	}

	n.DisplayNotification(notification.Payload{
		Title: "Conversation invite",
		Body:  "You have been invited to a new conversation",
	})

	return nil
}

func (n *Node) handleConversationNewMessage(ctx context.Context, input *p2p.Event) error {
	_, err := input.GetConversationNewMessageAttrs()
	if err != nil {
		return err
	}

	// say that conversation has not been read
	n.sql(ctx).Save(&entity.Conversation{ID: input.ConversationID, ReadAt: time.Time{}})

	n.DisplayNotification(notification.Payload{
		Title: "New message",
		Body:  "You have a new message",
	})
	return nil
}

func (n *Node) handleConversationRead(ctx context.Context, input *p2p.Event) error {
	_, err := input.GetConversationReadAttrs()
	if err != nil {
		return err
	}

	sql := n.sql(ctx)

	conversation := &entity.Conversation{ID: input.ConversationID}
	if err := sql.Model(conversation).Where(conversation).First(conversation).Error; err != nil {
		return err
	}

	attrs, err := input.GetConversationReadAttrs()
	if err != nil {
		return err
	}

	count := 0
	// set all messagse as seen
	if err := sql.
		Model(&p2p.Event{}).
		Where(&p2p.Event{
			ConversationID: input.ConversationID,
			Kind:           p2p.Kind_ConversationNewMessage,
			Direction:      p2p.Event_Outgoing,
		}).
		Count(&count).
		Update("seen_at", attrs.Conversation.ReadAt).
		Error; err != nil {
		return err
	}
	logger().Debug(fmt.Sprintf("CONVERSATION_READ %+v", count))
	return nil
}

//
// Devtools handlers
//

func (n *Node) handleDevtoolsMapset(ctx context.Context, input *p2p.Event) error {
	if n.devtools.mapset == nil {
		n.devtools.mapset = make(map[string]string)
	}
	attrs, err := input.GetDevtoolsMapsetAttrs()
	if err != nil {
		return err
	}
	n.devtools.mapset[attrs.Key] = attrs.Val
	return nil
}

func (n *Node) DevtoolsMapget(key string) string {
	return n.devtools.mapset[key]
}

func (n *Node) handleSenderAliasUpdate(ctx context.Context, input *p2p.Event) error {
	aliasesList, err := input.GetSenderAliasUpdateAttrs()

	if err != nil {
		return errorcodes.ErrDeserialization.Wrap(err)
	}

	for i := range aliasesList.Aliases {
		alias := aliasesList.Aliases[i]

		ID, err := uuid.NewV4()

		if err != nil {
			return errorcodes.ErrUUIDGeneratorFailed.Wrap(err)
		}

		alias.ID = ID.String()
		alias.Status = entity.SenderAlias_RECEIVED

		n.sql(ctx).Save(&alias)
	}

	return nil
}

func (n *Node) handleSeen(ctx context.Context, input *p2p.Event) error {
	var seenEvents []*p2p.Event
	seenCount := 0
	seenAttrs, err := input.GetSeenAttrs()

	if err != nil {
		return errors.Wrap(err, "unable to unmarshal seen attrs")
	}

	baseQuery := n.sql(ctx).
		Model(&p2p.Event{}).
		Where("id in (?)", seenAttrs.IDs)

	if err = baseQuery.
		Count(&seenCount).
		UpdateColumn("seen_at", input.SeenAt).
		Error; err != nil {
		return errors.Wrap(err, "unable to mark events as seen")
	}

	for _, seenEvent := range seenEvents {
		n.clientEvents <- seenEvent
	}

	return nil
}

func (n *Node) handleAck(ctx context.Context, input *p2p.Event) error {
	var ackedEvents []*p2p.Event
	ackCount := 0
	ackAttrs, err := input.GetAckAttrs()

	if err != nil {
		return errors.Wrap(err, "unable to unmarshal ack attrs")
	}

	baseQuery := n.sql(ctx).
		Model(&p2p.Event{}).
		Where("id in (?)", ackAttrs.IDs)

	if err = baseQuery.
		Count(&ackCount).
		UpdateColumn("acked_at", time.Now().UTC()).
		Error; err != nil {
		return errors.Wrap(err, "unable to mark events as acked")
	}

	if ackCount == 0 {
		return errors.Wrap(err, "no events to ack found")
	}

	if err = baseQuery.Find(&ackedEvents).Error; err != nil {
		return errors.Wrap(err, "unable to fetch acked events")
	}

	if err := n.handleAckSenderAlias(ctx, ackAttrs); err != nil {
		return errors.Wrap(err, "error while acking alias updates")
	}

	for _, ackedEvent := range ackedEvents {
		n.clientEvents <- ackedEvent
	}

	return nil
}

func (n *Node) handleAckSenderAlias(ctx context.Context, ackAttrs *p2p.AckAttrs) error {
	var events []*p2p.Event

	sql := n.sql(ctx)
	err := sql.
		Model(&p2p.Event{}).
		Where("id in (?)", ackAttrs.IDs).
		Where(p2p.Event{Kind: p2p.Kind_SenderAliasUpdate}).
		Find(&events).
		Error

	if err != nil {
		err := errors.Wrap(err, "unable to fetch acked alias updates")
		zap.Error(err)
		return err
	}

	for _, event := range events {
		attrs, err := event.GetSenderAliasUpdateAttrs()

		if err != nil {
			return errors.Wrap(err, "unable to unmarshal alias update attrs")
		}

		for _, alias := range attrs.Aliases {
			aliasesCount := 0

			err = sql.
				Model(&entity.SenderAlias{}).
				Where(&entity.SenderAlias{
					ConversationID:  alias.ConversationID,
					ContactID:       alias.ContactID,
					AliasIdentifier: alias.AliasIdentifier,
					Status:          entity.SenderAlias_SENT,
				}).
				Count(&aliasesCount).
				UpdateColumn("status", entity.SenderAlias_SENT_AND_ACKED).
				Error

			if err != nil {
				zap.Error(errors.Wrap(err, "unable to ack alias"))
			} else if aliasesCount == 0 {
				zap.Error(errors.New("unable to ack alias"))
			}
		}
	}

	return nil
}
