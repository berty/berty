package node

import (
	"context"

	"github.com/pkg/errors"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/sql"
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
