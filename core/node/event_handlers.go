package node

import (
	"context"
	"time"

	"github.com/satori/go.uuid"

	"go.uber.org/zap"

	"github.com/pkg/errors"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/sql"
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

	// FIXME: check if contact is not already known

	// save requester in db
	requester := attrs.Me
	requester.Status = entity.Contact_RequestedMe
	requester.Devices = []*entity.Device{
		{
			ID: input.SenderID,
			//Key: crypto.NewPublicKey(p2p.GetPubkey(ctx)),
		},
	}
	if err := n.sql.Set("gorm:association_autoupdate", true).Save(requester).Error; err != nil {
		return err
	}

	// nothing more to do, now we wait for the UI to accept the request
	return nil
}

func (n *Node) handleContactRequestAccepted(ctx context.Context, input *p2p.Event) error {
	// fetching existing contact from db
	contact, err := sql.ContactByID(n.sql, input.SenderID)
	if err != nil {
		return errors.Wrap(err, "no such contact")
	}

	contact.Status = entity.Contact_IsFriend
	//contact.Devices[0].Key = crypto.NewPublicKey(p2p.GetPubkey(ctx))
	if err := n.sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
		return err
	}

	// send my contact
	if err := n.contactShareMe(contact); err != nil {
		return err
	}

	if err := n.networkDriver.Join(ctx, input.SenderID); err != nil {
		return err
	}
	return nil
}

func (n *Node) handleContactShareMe(ctx context.Context, input *p2p.Event) error {
	attrs, err := input.GetContactShareMeAttrs()
	if err != nil {
		return err
	}

	// fetching existing contact from db
	contact, err := sql.ContactByID(n.sql, input.SenderID)
	if err != nil {
		return errors.Wrap(err, "no such contact")
	}

	// FIXME: UI: ask for confirmation before update
	contact.DisplayName = attrs.Me.DisplayName
	contact.DisplayStatus = attrs.Me.DisplayStatus
	// FIXME: save more attributes
	return n.sql.Save(contact).Error
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

	// save conversation
	if err := n.sql.Set("gorm:association_autoupdate", true).Save(conversation).Error; err != nil {
		return errors.Wrap(err, "failed to save conversation")
	}

	if err := n.networkDriver.Join(ctx, attrs.Conversation.ID); err != nil {
		return err
	}
	return nil
}

func (n *Node) handleConversationNewMessage(ctx context.Context, input *p2p.Event) error {
	_, err := input.GetConversationNewMessageAttrs()
	if err != nil {
		return err
	}

	// nothing to do

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
		return errors.Wrap(err, "unable to unmarshal aliases list")
	}

	for i := range aliasesList.Aliases {
		alias := aliasesList.Aliases[i]

		ID, err := uuid.NewV4()

		if err != nil {
			return errors.Wrap(err, "unable to generate a uuid")
		}

		alias.ID = ID.String()
		alias.Status = entity.SenderAlias_RECEIVED

		n.sql.Save(&alias)
	}

	return nil
}

func (n *Node) handleAck(ctx context.Context, input *p2p.Event) error {
	ackCount := 0
	ackAttrs, err := input.GetAckAttrs()

	if err != nil {
		return errors.Wrap(err, "unable to unmarshal ack attrs")
	}

	if err = n.sql.
		Model(&p2p.Event{}).
		Where("id in (?)", ackAttrs.IDs).
		Count(&ackCount).
		UpdateColumn("acked_at", time.Now()).
		Error; err != nil {
		return errors.Wrap(err, "unable to mark events as acked")
	}

	if ackCount == 0 {
		return errors.Wrap(err, "no events to ack found")
	}

	if err := n.handleAckSenderAlias(ctx, ackAttrs); err != nil {
		return errors.Wrap(err, "error while acking alias updates")
	}

	return nil
}

func (n *Node) handleAckSenderAlias(ctx context.Context, ackAttrs *p2p.AckAttrs) error {
	var events []*p2p.Event

	err := n.sql.
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

			err = n.sql.
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
