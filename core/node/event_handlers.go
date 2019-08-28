package node

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/gofrs/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"

	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/i18n"
	"berty.tech/core/pkg/notification"
	bsql "berty.tech/core/sql"
	"github.com/jinzhu/gorm"
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
	contact, err := bsql.ContactByID(sql, attrs.Me.ID)
	if errors.Cause(err) == gorm.ErrRecordNotFound {
		// save contact in database
		contact, err = entity.NewContact(
			attrs.Me.ID,
			attrs.Me.DisplayName,
			entity.Contact_Unknown,
		)
		if err != nil {
			return err
		}
	}

	// save requester in db
	devices := attrs.Me.Devices

	if err := contact.RequestedMe(input.CreatedAt); err != nil {
		return errors.Wrap(err, "handleContactRequest")
	}

	if err := sql.Set("gorm:association_autoupdate", true).Save(contact).Error; err != nil {
		return err
	}

	n.DisplayNotification(&notification.Payload{
		Title: i18n.T("ContactRequestTitle", nil),
		Body: i18n.T("ContactRequestBody", map[string]interface{}{
			"Name": contact.DisplayName,
		}),
		DeepLink: "berty://berty.tech/id#key=" + url.PathEscape(contact.ID) + "&name=" + url.PathEscape(contact.DisplayName),
	})

	if err := entity.SaveDevices(sql, contact.ID, devices); err != nil {
		return errorcodes.ErrDbCreate.Wrap(err)
	}

	// nothing more to do, now we wait for the UI to accept the request
	return nil
}

func (n *Node) handleContactRequestAccepted(ctx context.Context, input *entity.Event) error {
	// fetching existing contact from db
	sql := n.sql(ctx)
	contact, err := bsql.ContactByID(sql, input.SourceDeviceID)
	if err != nil {
		return bsql.GenericError(err)
	}

	if err := contact.AcceptedMe(input.CreatedAt); err != nil {
		return err
	}

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
	contact, err := bsql.ContactByID(sql, input.SourceDeviceID)
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

// deprecated
func (n *Node) handleConversationUpdate(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetConversationUpdateAttrs()
	if err != nil {
		return err
	}

	sql := n.sql(ctx)

	// find conversation
	conversation := &entity.Conversation{ID: attrs.Conversation.ID}
	if err = sql.Find(&conversation).Error; err != nil {
		return err
	}

	// get interactive member
	cm, err := conversation.GetMember(input.SourceContactID)
	if err != nil {
		return errorcodes.ErrNodeHandleConversationUpdate.Wrap(err)
	}

	if err := sql.Preload("Conversation").First(cm).Error; err != nil {
		return bsql.GenericError(err)
	}

	if err := cm.SetTitle(attrs.Conversation.Title); err != nil {
		return errorcodes.ErrNodeHandleConversationUpdate.Wrap(err)
	}

	if err := cm.SetTopic(attrs.Conversation.Title); err != nil {
		return errorcodes.ErrNodeHandleConversationUpdate.Wrap(err)
	}

	if err := bsql.ConversationSave(sql, conversation); err != nil {
		return errorcodes.ErrNodeHandleConversationUpdate.Wrap(err)
	}

	return nil
}

// deprecated
func (n *Node) handleConversationInvite(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetConversationInviteAttrs()
	if err != nil {
		return err
	}

	sql := n.sql(ctx)

	conversation := attrs.Conversation
	// legacy check kind if unknown
	if conversation.Kind == entity.Conversation_Unknown {
		if len(conversation.Members) == 2 && conversation.ID == entity.GetOneToOneID(
			conversation.Members[0].Contact,
			conversation.Members[1].Contact,
		) {
			conversation.Kind = entity.Conversation_OneToOne
		}
	}

	// legacy hack to have badge notification
	// member.Invite() alreay does this
	member, err := conversation.GetMember(input.SourceContactID)
	if err != nil {
		return err
	}
	if err := member.Write(time.Now(), nil); err != nil {
		return err
	}

	if err = bsql.ConversationSave(sql, conversation); err != nil {
		return err
	}

	n.DisplayNotification(&notification.Payload{
		Title:    i18n.T("ConversationInviteTitle", nil),
		Body:     i18n.T("ConversationInviteBody", nil),
		DeepLink: "berty://berty.chat/chats/detail#id=" + url.PathEscape(conversation.ID),
	})

	return nil
}

// deprecated
func (n *Node) handleConversationNewMessage(ctx context.Context, input *entity.Event) error {
	var err error

	attrs, err := input.GetConversationNewMessageAttrs()
	if err != nil {
		n.LogBackgroundWarn(ctx, errors.New("handleConversationNewMessage: Conversation not found"))
		return err
	}

	sql := n.sql(ctx)

	// find conversation
	conversation := &entity.Conversation{ID: input.TargetAddr}
	if err = sql.Find(&conversation).Error; err != nil {
		return err
	}

	// legacy check kind if unknown
	if conversation.Kind == entity.Conversation_Unknown {
		if len(conversation.Members) == 2 && conversation.ID == entity.GetOneToOneID(
			conversation.Members[0].Contact,
			conversation.Members[1].Contact,
		) {
			conversation.Kind = entity.Conversation_OneToOne
		}
	}

	// get interactive member
	im, err := conversation.GetMember(input.SourceContactID)
	if err != nil {
		n.LogBackgroundWarn(ctx, errors.New("handleConversationNewMessage: Member not found"))
		return err
	}

	// say that member have write to conversation
	if err = im.Write(input.CreatedAt, attrs.Message); err != nil {
		return err
	}

	// save conversation
	if err = bsql.ConversationSave(sql, conversation); err != nil {
		return err
	}

	title := i18n.T("NewMessageTitle", nil)
	body := i18n.T("NewMessageBody", nil)

	if n.config.NotificationsPreviews && conversation.ID != "" {
		title = conversation.GetComputedTitle()
		body = attrs.Message.Text

		if im.GetContact().DisplayName != "" && len(conversation.Members) > 2 {
			title = fmt.Sprintf("%s @ %s", im.GetContact().DisplayName, title)
		}
	}

	n.DisplayNotification(&notification.Payload{
		Title:    title,
		Body:     body,
		DeepLink: "berty://berty.chat/chats/detail#id=" + url.PathEscape(input.TargetAddr),
	})
	return nil
}

// deprecated
func (n *Node) handleConversationRead(ctx context.Context, input *entity.Event) error {
	attrs, err := input.GetConversationReadAttrs()
	if err != nil {
		return err
	}

	sql := n.sql(ctx)

	// find conversation
	conversation := &entity.Conversation{ID: input.TargetAddr}
	if err = sql.Find(&conversation).Error; err != nil {
		return err
	}

	// legacy check kind if unknown
	if conversation.Kind == entity.Conversation_Unknown {
		if len(conversation.Members) == 2 && conversation.ID == entity.GetOneToOneID(
			conversation.Members[0].Contact,
			conversation.Members[1].Contact,
		) {
			conversation.Kind = entity.Conversation_OneToOne
		}
	}

	// get interactive member
	im, err := conversation.GetMember(input.SourceContactID)
	if err != nil {
		return err
	}

	if err = im.Read(attrs.Conversation.ReadAt); err != nil {
		return err
	}

	// save conversation
	if err = bsql.ConversationSave(sql, conversation); err != nil {
		return err
	}

	count := 0
	// set all messagse as seen
	if err := sql.
		Model(&entity.Event{}).
		Where(&entity.Event{
			TargetAddr: input.TargetAddr,
			TargetType: input.TargetType,
			Kind:       entity.Kind_ConversationNewMessage,
			Direction:  entity.Event_Outgoing,
		}).
		Count(&count).
		Update("seen_at", attrs.Conversation.ReadAt).
		Error; err != nil {
		return err
	}
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
	var events []*entity.Event
	ackCount := 0
	now := time.Now().UTC()

	ackAttrs, err := input.GetAckAttrs()
	if err != nil {
		return errors.Wrap(err, "unable to unmarshal ack attrs")
	}

	eventsIDs := ackAttrs.IDs

	if err := n.sql(ctx).
		Model(&entity.Event{}).
		Where("id IN (?)", eventsIDs).
		Find(&events).Error; err != nil {
		return errors.Wrap(err, "unable to find events to ack")
	}

	if err := n.sql(ctx).
		Model(&entity.EventDispatch{}).
		Where("event_id in (?) AND contact_id = ? AND device_id = ?", eventsIDs, input.SourceContactID, input.SourceDeviceID).
		Count(&ackCount).
		UpdateColumn("acked_at", &now).Error; err != nil {
		return errors.Wrap(err, "unable to find event dispatch to ack")
	}

	if err := n.sql(ctx).
		Model(&entity.Event{}).
		Where("id IN (?) AND ack_status = ?", eventsIDs, entity.Event_NotAcked).
		UpdateColumns(&entity.Event{
			AckStatus: entity.Event_AckedAtLeastOnce,
		}).Error; err != nil {
		return errors.Wrap(err, "unable to find event dispatch to ack")
	}

	// TODO: find events acknowledged by at least one device per contact

	whollyAcknowledgedEventsIDs := []string{}

	if err := n.sql(ctx).
		Model(&entity.Event{}).
		Joins("LEFT JOIN event_dispatch ON event_dispatch.event_id = event.id AND event_dispatch.acked_at IS NULL").
		Where("event.id in (?) AND event_dispatch.device_id IS NULL", eventsIDs).
		Pluck("event.id", &whollyAcknowledgedEventsIDs).
		Error; err != nil {
		return errors.Wrap(err, "unable to find events")
	}

	if len(whollyAcknowledgedEventsIDs) == 0 {
		return nil
	}

	if err := n.sql(ctx).
		Model(&entity.Event{}).
		Where("id IN (?)", whollyAcknowledgedEventsIDs).
		UpdateColumns(&entity.Event{
			AckedAt:   &now,
			AckStatus: entity.Event_AckedByAllDevices,
		}).Error; err != nil {
		return errors.Wrap(err, "unable to update events acks")
	}

	ackedEvents := []*entity.Event{}
	if err := n.sql(ctx).
		Model(&entity.Event{}).
		Where("id IN (?)", whollyAcknowledgedEventsIDs).
		Find(&ackedEvents).Error; err != nil {
		return errors.Wrap(err, "unable to find acked events")
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
