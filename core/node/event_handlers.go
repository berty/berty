package node

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/i18n"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/push"
	bsql "berty.tech/core/sql"
	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type EventHandler func(context.Context, *entity.Event) error

//
// Contact handlers
//

func (n *Node) handleContactRequest(ctx context.Context, input *entity.Event) error {
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
	devices := attrs.Me.Devices

	requester := attrs.Me
	requester.Devices = []*entity.Device{}
	requester.Status = entity.Contact_RequestedMe
	if err := sql.Set("gorm:association_autoupdate", true).Save(requester).Error; err != nil {
		return err
	}

	n.DisplayNotification(&notification.Payload{
		Title: i18n.T("ContactRequestTitle", nil),
		Body: i18n.T("ContactRequestBody", map[string]interface{}{
			"Name": attrs.Me.DisplayName,
		}),
		DeepLink: "berty://berty.chat/contacts/add#id=" + url.PathEscape(attrs.Me.ID) + "&display-name=" + url.PathEscape(attrs.Me.DisplayName),
	})

	if err := entity.SaveDevices(sql, attrs.Me.ID, devices); err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}

	// nothing more to do, now we wait for the UI to accept the request
	return nil
}

func (n *Node) handleContactRequestAccepted(ctx context.Context, input *entity.Event) error {
	// fetching existing contact from db
	sql := n.sql(ctx)
	contact, err := bsql.ContactByID(sql, input.SenderID)
	if err != nil {
		return bsql.GenericError(err)
	}

	contact.Status = entity.Contact_IsFriend
	//contact.Devices[0].Key = crypto.NewPublicKey(entity.GetPubkey(ctx))
	if err := sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
		return err
	}

	// send my contact
	if err := n.contactShareMe(ctx, contact); err != nil {
		return err
	}

	var deepLink string
	conv, err := bsql.ConversationOneToOne(sql, n.config.Myself.ID, contact.ID)
	if err == nil {
		deepLink = "berty://berty.chat/chats/detail#id=" + url.PathEscape(conv.ID)
	}

	n.DisplayNotification(&notification.Payload{
		Title: i18n.T("ContactRequestAccpetedTitle", nil),
		Body: i18n.T("ContactRequestAccpetedBody", map[string]interface{}{
			"Name": contact.DisplayName,
		}),
		DeepLink: deepLink,
	})
	return nil
}

func (n *Node) handleContactShareMe(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetContactShareMeAttrs()
	if err != nil {
		return err
	}

	// fetching existing contact from db
	sql := n.sql(ctx)
	contact, err := bsql.ContactByID(sql, input.SenderID)
	if err != nil {
		return bsql.GenericError(err)
	}

	// FIXME: UI: ask for confirmation before update
	contact.DisplayName = attrs.Me.DisplayName
	contact.DisplayStatus = attrs.Me.DisplayStatus
	contact.Devices = []*entity.Device{}

	// FIXME: save more attributes
	if err := sql.Save(contact).Error; err != nil {
		return errorcodes.ErrDbUpdate.Wrap(err)
	}

	if err := entity.SaveDevices(sql, attrs.Me.ID, attrs.Me.Devices); err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}

	return nil
}

//
// Conversation handlers
//

func (n *Node) handleConversationUpdate(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetConversationUpdateAttrs()
	if err != nil {
		return err
	}

	if err := n.sql(ctx).Save(attrs.Conversation).Error; err != nil {
		return errors.Wrap(err, "cannot update conversation")
	}

	return nil
}

func (n *Node) handleConversationInvite(ctx context.Context, input *entity.Event) error {
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

	n.DisplayNotification(&notification.Payload{
		Title:    i18n.T("ConversationInviteTitle", nil),
		Body:     i18n.T("ConversationInviteBody", nil),
		DeepLink: "berty://berty.chat/chats/detail#id=" + url.PathEscape(attrs.Conversation.ID),
	})

	return nil
}

func (n *Node) handleConversationNewMessage(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetConversationNewMessageAttrs()
	if err != nil {
		return err
	}

	// say that conversation has not been read
	n.sql(ctx).Save(&entity.Conversation{
		ID:     input.ConversationID,
		ReadAt: time.Time{},
		Infos:  attrs.Message.Text,
	})

	sender := &entity.Contact{}
	if err := n.sql(ctx).First(&sender, &entity.Contact{ID: input.SenderID}).Error; err != nil {
		n.LogBackgroundWarn(ctx, errors.New("handleConversationNewMessage: Contact not found"))
		sender = &entity.Contact{}
	}

	conversation := &entity.Conversation{}
	if err := n.sql(ctx).First(&conversation, &entity.Conversation{ID: input.ConversationID}).Error; err != nil {
		n.LogBackgroundWarn(ctx, errors.New("handleConversationNewMessage: Conversation not found"))
		conversation = &entity.Conversation{}
	}

	title := i18n.T("NewMessageTitle", nil)
	body := i18n.T("NewMessageBody", nil)

	if n.config.NotificationsPreviews && conversation.ID != "" {
		title = conversation.GetConversationTitle()
		body = attrs.Message.Text

		if sender.DisplayName != "" && len(conversation.Members) > 2 {
			title = fmt.Sprintf("%s @ %s", sender.DisplayName, title)
		}
	}

	n.DisplayNotification(&notification.Payload{
		Title:    title,
		Body:     body,
		DeepLink: "berty://berty.chat/chats/detail#id=" + url.PathEscape(input.ConversationID),
	})
	return nil
}

func (n *Node) handleConversationRead(ctx context.Context, input *entity.Event) error {
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
		Model(&entity.Event{}).
		Where(&entity.Event{
			ConversationID: input.ConversationID,
			Kind:           entity.Kind_ConversationNewMessage,
			Direction:      entity.Event_Outgoing,
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

func (n *Node) handleDevtoolsMapset(ctx context.Context, input *entity.Event) error {
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

func (n *Node) handleSenderAliasUpdate(ctx context.Context, input *entity.Event) error {
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

func (n *Node) handleSeen(ctx context.Context, input *entity.Event) error {
	var seenEvents []*entity.Event
	seenCount := 0
	seenAttrs, err := input.GetSeenAttrs()

	if err != nil {
		return errors.Wrap(err, "unable to unmarshal seen attrs")
	}

	baseQuery := n.sql(ctx).
		Model(&entity.Event{}).
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

func (n *Node) handleAck(ctx context.Context, input *entity.Event) error {
	var ackedEvents []*entity.Event
	ackCount := 0
	ackAttrs, err := input.GetAckAttrs()

	if err != nil {
		return errors.Wrap(err, "unable to unmarshal ack attrs")
	}

	baseQuery := n.sql(ctx).
		Model(&entity.Event{}).
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

func (n *Node) handleAckSenderAlias(ctx context.Context, ackAttrs *entity.AckAttrs) error {
	var events []*entity.Event

	sql := n.sql(ctx)
	err := sql.
		Model(&entity.Event{}).
		Where("id in (?)", ackAttrs.IDs).
		Where(entity.Event{Kind: entity.Kind_SenderAliasUpdate}).
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

func (n *Node) handleDevicePushTo(ctx context.Context, event *entity.Event) error {
	logger().Info("Sending push to device")
	pushAttrs, err := event.GetDevicePushToAttrs()

	if err != nil {
		return errorcodes.ErrDeserialization.New()
	}

	identifier, err := n.crypto.Decrypt(pushAttrs.PushIdentifier)

	if err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	pushDestination := &push.PushDestination{}

	if err := pushDestination.Unmarshal(identifier); err != nil {
		return errorcodes.ErrPushUnknownDestination.Wrap(err)
	}

	if err := n.pushManager.Dispatch(&push.PushData{
		PushIdentifier: pushAttrs.PushIdentifier,
		Envelope:       pushAttrs.Envelope,
		Priority:       pushAttrs.Priority,
	}, pushDestination); err != nil {
		logger().Error(errorcodes.ErrPush.Wrap(err).Error())
	}

	return nil
}

func (n *Node) handleDeviceUpdatePushConfig(ctx context.Context, event *entity.Event) error {
	attrs, err := event.GetDeviceUpdatePushConfigAttrs()

	if err != nil {
		return errorcodes.ErrDeserialization.New()
	}

	device := &entity.Device{}

	if err := n.sql(ctx).First(&device, &entity.Device{ID: attrs.Device.ID}).Error; err != nil {
		return errorcodes.ErrDb.New()
	}

	if device == nil {
		return errorcodes.ErrDbNothingFound.New()
	}

	if err := attrs.Device.UpdatePushIdentifiers(n.sql(ctx), attrs.Device.PushIdentifiers); err != nil {
		return errorcodes.ErrPushInvalidIdentifier.Wrap(err)
	}

	return nil
}
