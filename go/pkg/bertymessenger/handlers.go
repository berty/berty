package bertymessenger

import (
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

/* TODO: add generated handler bundle something like:
** type protocolEventsHandlers struct {
** 	accountGroupJoined                    func(svc *service, gme *bertytypes.GroupMetadataEvent, ev bertytypes.AccountGroupJoined) error
** 	accountContactRequestOutgoingEnqueued func(svc *service, gme *bertytypes.GroupMetadataEvent, ev bertytypes.AccountContactRequestEnqueued) error
** 	// etc..
** }
**
**  then also generate handleProtocolEvent that calls functions that are defined in the passed-in bundle
 */

func handleProtocolEvent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	eventTypeHandlers := map[bertytypes.EventType]func(svc *service, gme *bertytypes.GroupMetadataEvent) error{
		bertytypes.EventTypeAccountGroupJoined:                    accountGroupJoined,
		bertytypes.EventTypeAccountContactRequestOutgoingEnqueued: accountContactRequestOutgoingEnqueued,
		bertytypes.EventTypeAccountContactRequestOutgoingSent:     accountContactRequestOutgoingSent,
		bertytypes.EventTypeAccountContactRequestIncomingReceived: accountContactRequestIncomingReceived,
		bertytypes.EventTypeAccountContactRequestIncomingAccepted: accountContactRequestIncomingAccepted,
		bertytypes.EventTypeGroupMemberDeviceAdded:                groupMemberDeviceAdded,
		bertytypes.EventTypeGroupMetadataPayloadSent:              groupMetadataPayloadSent,
	}

	et := gme.GetMetadata().GetEventType()
	svc.logger.Info("received protocol event", zap.String("type", et.String()))

	handler, ok := eventTypeHandlers[et]
	if !ok {
		svc.logger.Info("event ignored", zap.String("type", et.String()))
		return nil
	}

	return handler(svc, gme)
}

func groupMetadataPayloadSent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var appMetadata bertytypes.AppMetadata
	if err := proto.Unmarshal(gme.GetEvent(), &appMetadata); err != nil {
		return err
	}

	var appMessage AppMessage
	if err := proto.Unmarshal(appMetadata.GetMessage(), &appMessage); err != nil {
		return err
	}

	groupMessageEvent := bertytypes.GroupMessageEvent{
		EventContext: gme.GetEventContext(),
		Message:      appMetadata.GetMessage(),
		Headers:      &bertytypes.MessageHeaders{DevicePK: appMetadata.GetDevicePK()},
	}

	groupPK := bytesToString(gme.GetEventContext().GetGroupPK())

	return handleAppMessage(svc, groupPK, &groupMessageEvent, &appMessage)
}

func accountGroupJoined(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	gpkb := ev.GetGroup().GetPublicKey()
	groupPK := bytesToString(gpkb)
	isNew := false

	conversation, err := svc.db.addConversation(groupPK)
	if err == nil {
		isNew = true
		svc.logger.Info("saved conversation in db")

		// dispatch event
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conversation})
		if err != nil {
			return err
		}
	} else if !errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return errcode.ErrDBAddConversation.Wrap(err)
	}

	// activate group
	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb}); err != nil {
		svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(gpkb)))
	}

	// subscribe to group
	if err := svc.subscribeToGroup(gpkb); err != nil {
		return err
	}

	svc.logger.Info("AccountGroupJoined", zap.String("pk", groupPK), zap.Bool("is-new", isNew), zap.String("known-as", conversation.GetDisplayName()))

	return nil
}

func accountContactRequestOutgoingEnqueued(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPKBytes := ev.GetContact().GetPK()
	contactPK := bytesToString(contactPKBytes)

	var cm ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		return err
	}

	gpk := bytesToString(ev.GetGroupPK())
	if gpk == "" {
		groupInfoReply, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{ContactPK: contactPKBytes})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		gpk = bytesToString(groupInfoReply.GetGroup().GetPublicKey())
	}

	contact, err := svc.db.addContactRequestOutgoingEnqueued(contactPK, cm.DisplayName, gpk)
	if errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return nil
	} else if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingEnqueud.Wrap(err)
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact})
}

func accountContactRequestOutgoingSent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPK := bytesToString(ev.GetContactPK())

	contact, err := svc.db.addContactRequestOutgoingSent(contactPK)
	if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
	}

	// dispatch event
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact})
		if err != nil {
			return err
		}
	}

	groupPK, err := groupPKFromContactPK(svc.ctx, svc.protocolClient, ev.GetContactPK())
	if err != nil {
		return err
	}

	// subscribe to group metadata
	{
		_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(groupPK)))
		}
	}
	return svc.subscribeToMetadata(groupPK)
}

func accountContactRequestIncomingReceived(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	contactPK := bytesToString(ev.GetContactPK())

	var m ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		return err
	}

	contact, err := svc.db.addContactRequestIncomingReceived(contactPK, m.GetDisplayName())
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact})
}

func accountContactRequestIncomingAccepted(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestAccepted
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	if ev.GetContactPK() == nil {
		return errcode.ErrInvalidInput
	}
	contactPK := bytesToString(ev.GetContactPK())

	groupPK, err := groupPKFromContactPK(svc.ctx, svc.protocolClient, ev.GetContactPK())
	if err != nil {
		return err
	}

	contact, conversation, err := svc.db.addContactRequestIncomingAccepted(contactPK, bytesToString(groupPK))
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
	}

	// dispatch event to subscribers
	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact}); err != nil {
		return err
	}

	if err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conversation}); err != nil {
		return err
	}

	// activate group
	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
		svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(groupPK)))
	}

	// subscribe to group messages
	return svc.subscribeToGroup(groupPK)
}

func contactRequestAccepted(svc *service, contact *Contact, memberPK []byte) error {
	// someone you invited just accepted the invitation
	// update contact
	var groupPK []byte
	{
		var err error
		if groupPK, err = groupPKFromContactPK(svc.ctx, svc.protocolClient, memberPK); err != nil {
			return err
		}

		contact.State = Contact_Established
		contact.ConversationPublicKey = bytesToString(groupPK)
	}

	// create new contact conversation
	var conversation Conversation

	// update db
	if err := svc.db.tx(func(tx *dbWrapper) error {
		var err error

		// update existing contact
		if err = tx.updateContact(*contact); err != nil {
			return err
		}

		// create new conversation
		if conversation, err = tx.addConversationForContact(contact.ConversationPublicKey, contact.PublicKey); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	// dispatch events
	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact}); err != nil {
		return err
	}

	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conversation}); err != nil {
		return err
	}

	// activate group and subscribe to message events
	if _, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
		svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(groupPK)))
	}

	return svc.subscribeToMessages(groupPK)
}

// groupMemberDeviceAdded is called at different moments
// * on AccountGroup when you add a new device to your group
// * on ContactGroup when you or your contact add a new device
// * on MultiMemberGroup when you or anyone in a multimember group adds a new device
// nolint:gocyclo
func groupMemberDeviceAdded(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.GroupAddMemberDevice
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	mpkb := ev.GetMemberPK()
	dpkb := ev.GetDevicePK()
	gpkb := gme.GetEventContext().GetGroupPK()

	if mpkb == nil || dpkb == nil || gpkb == nil {
		return errcode.ErrInvalidInput
	}

	mpk := bytesToString(mpkb)
	dpk := bytesToString(dpkb)
	gpk := bytesToString(gpkb)

	// Ensure the event has is not emitted by the current user
	if isMe, err := checkIsMe(
		svc.ctx,
		svc.protocolClient,
		&bertytypes.GroupMessageEvent{
			EventContext: gme.GetEventContext(),
			Headers:      &bertytypes.MessageHeaders{DevicePK: dpkb},
		},
	); err != nil {
		return err
	} else if isMe {
		svc.logger.Debug("ignoring member device because isMe")
		return nil
	}

	// Register device if not already known
	if _, err := svc.db.getDeviceByPK(dpk); err == gorm.ErrRecordNotFound {
		device, err := svc.db.addDevice(dpk, mpk)
		if err != nil {
			return err
		}

		err = svc.dispatcher.StreamEvent(StreamEvent_TypeDeviceUpdated, &StreamEvent_DeviceUpdated{Device: &device})
		if err != nil {
			svc.logger.Error("error dispatching device updated", zap.Error(err))
		}
	}

	// Check whether a contact request has been accepted (a device from the contact has been added to the group)
	if contact, err := svc.db.getContactByPK(mpk); err == nil && contact.GetState() == Contact_OutgoingRequestSent {
		return contactRequestAccepted(svc, &contact, mpkb)
	}

	// check backlogs
	{
		backlog, err := svc.db.attributeBacklogInteractions(dpk, gpk, mpk)
		displayName := ""

		for _, elem := range backlog {
			svc.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), zap.String("device-pk", elem.GetDevicePublicKey()), zap.String("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case AppMessage_TypeSetUserName:
				var payload AppMessage_SetUserName

				if err := proto.Unmarshal(elem.GetPayload(), &payload); err != nil {
					return err
				}

				displayName = payload.GetName()

				if err := svc.db.deleteInteractions([]string{elem.CID}); err != nil {
					return err
				}

				if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{elem.GetCID()}); err != nil {
					return err
				}

			default:
				err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{elem})
				if err != nil {
					return err
				}
			}
		}

		member, err := svc.db.addMember(mpk, gpk, displayName)
		if err != nil {
			return err
		}

		err = svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{member})
		if err != nil {
			return err
		}

		svc.logger.Info("dispatched member update", zap.String("name", member.GetDisplayName()), zap.String("conv", gpk))
	}

	return nil
}

func handleAppMessageAcknowledge(svc *service, tx *dbWrapper, i Interaction, amPayload proto.Message) (Interaction, error) {
	payload := amPayload.(*AppMessage_Acknowledge)

	if found, err := tx.markInteractionAsAcknowledged(payload.Target); err != nil {
		return i, err
	} else if found {
		target, err := tx.getInteractionByCID(payload.Target)
		if err != nil {
			return i, err
		}

		if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{&target}); err != nil {
			return i, nil
		}
	}

	i.TargetCID = payload.Target
	i, err := tx.addInteraction(i)
	if err != nil {
		return i, err
	}

	svc.logger.Debug("added ack in backlog", zap.String("target", payload.GetTarget()), zap.String("cid", i.GetCID()))
	return i, nil
}

func handleAppMessageGroupInvitation(svc *service, tx *dbWrapper, i Interaction, _ proto.Message) (Interaction, error) {
	i, err := tx.addInteraction(i)
	if err != nil {
		return i, err
	}

	err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{&i})
	return i, err
}

func handleAppMessageUserMessage(svc *service, tx *dbWrapper, i Interaction, amPayload proto.Message) (Interaction, error) {
	i, err := tx.addInteraction(i)
	if err != nil {
		return i, err
	}

	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{&i}); err != nil {
		return i, err
	}

	if !i.IsMe {
		return i, nil
	}

	svc.logger.Debug("sending ack", zap.String("target", i.CID))

	// send ack

	// Don't send ack if message is already acked to prevent spam in multimember groups
	// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
	amp, err := AppMessage_TypeAcknowledge.MarshalPayload(0, &AppMessage_Acknowledge{Target: i.CID})
	if err != nil {
		return i, err
	}

	cpk, err := stringToBytes(i.ConversationPublicKey)
	if err != nil {
		return i, err
	}

	req := bertytypes.AppMessageSend_Request{
		GroupPK: cpk,
		Payload: amp,
	}
	_, err = svc.protocolClient.AppMessageSend(svc.ctx, &req)
	if err != nil {
		return i, err
	}

	// notify
	// FIXME: also notify if app is in background
	openedConversation := svc.openedConversation.Load()

	if openedConversation != i.ConversationPublicKey {
		// fetch contact from db
		var contact Contact
		if i.Conversation.Type == Conversation_ContactType {
			if contact, err = tx.getContactByPK(i.Conversation.ContactPublicKey); err != nil {
				svc.logger.Warn("1to1 message contact not found", zap.String("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
			}
		}

		payload := amPayload.(*AppMessage_UserMessage)
		var title string
		body := payload.GetBody()
		if i.Conversation.Type == Conversation_ContactType {
			title = contact.GetDisplayName()
		} else {
			title = i.Conversation.GetDisplayName()
			memberName := i.Member.GetDisplayName()
			if memberName != "" {
				body = memberName + ": " + payload.GetBody()
			}
		}
		msgRecvd := StreamEvent_Notified_MessageReceived{Interaction: &i, Conversation: i.Conversation, Contact: &contact}
		err = svc.dispatcher.Notify(StreamEvent_Notified_TypeMessageReceived, title, body, &msgRecvd)

		if err != nil {
			svc.logger.Error("failed to notify", zap.Error(err))
		}
	}

	return i, nil
}

func handleAppMessageSetUserName(svc *service, tx *dbWrapper, i Interaction, amPayload proto.Message) (Interaction, error) {
	if i.IsMe {
		svc.logger.Info("ignoring SetUserName because isMe")
		return i, nil
	}

	svc.logger.Debug("interesting SetUserName")

	payload := amPayload.(*AppMessage_SetUserName)

	if i.MemberPublicKey == "" {
		// store in backlog
		svc.logger.Info("storing SetUserName in backlog", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))
		return tx.addInteraction(i)
	}

	member, err := svc.db.addMember(i.MemberPublicKey, i.ConversationPublicKey, payload.GetName())
	if err != nil {
		return i, err
	}

	err = svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{Member: member})
	if err != nil {
		return i, err
	}

	svc.logger.Debug("dispatched member update", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))

	return i, nil
}

func interactionFromAppMessage(svc *service, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) (Interaction, error) {
	amt := am.GetType()
	cidb := gme.GetEventContext().GetID()
	cid := bytesToString(cidb)
	isMe, err := checkIsMe(svc.ctx, svc.protocolClient, gme)
	if err != nil {
		return Interaction{}, err
	}

	dpkb := gme.GetHeaders().GetDevicePK()
	dpk := bytesToString(dpkb)

	i := Interaction{
		CID:                   cid,
		Type:                  amt,
		Payload:               am.GetPayload(),
		IsMe:                  isMe,
		ConversationPublicKey: gpk,
		SentDate:              am.GetSentDate(),
		DevicePublicKey:       dpk,
	}
	svc.logger.Debug("received app message", zap.String("type", amt.String()))

	return i, nil
}

func hydrateInteraction(svc *service, gme *bertytypes.GroupMessageEvent, i *Interaction) error {
	return svc.db.tx(func(tx *dbWrapper) error {
		var err error

		// fetch conv from db
		conversation, err := svc.db.getConversationByPK(i.ConversationPublicKey)
		if err != nil {
			// FIXME: maybe we should accept receiving app messages on unknown conversations?
			svc.logger.Warn("ignored message because conv not found")
			return err
		}

		i.Conversation = &conversation

		if i.Conversation.Type == Conversation_MultiMemberType {
			// fetch member from db
			member, err := svc.db.getMemberByPK(i.MemberPublicKey)
			if err != nil {
				svc.logger.Warn("multimember message member not found", zap.String("public-key", i.MemberPublicKey), zap.Error(err))
			}

			i.Member = &member
		}

		// build device
		{
			dpkb := gme.GetHeaders().GetDevicePK()
			dpk := bytesToString(dpkb)

			switch {
			case i.IsMe: // myself
				i.MemberPublicKey = ""

			case i.Conversation.GetType() == Conversation_ContactType: // 1-1 conversation
				i.MemberPublicKey = ""
				// FIXME: multiple devices per contact?

			default:
				existingDevice, err := svc.db.getDeviceByPK(dpk)
				if err == nil { // device already exists
					i.MemberPublicKey = existingDevice.GetOwnerPublicKey()
				} else { // device not found
					i.MemberPublicKey = "" // backlog magic
				}
			}
		}

		// extract ack from backlog
		{
			cids, err := svc.db.getAcknowledgementsCIDsForInteraction(i.CID)
			if err != nil {
				return err
			}

			if len(cids) > 0 {
				i.Acknowledged = true

				if err := svc.db.deleteInteractions(cids); err != nil {
					return err
				}

				for _, c := range cids {
					svc.logger.Debug("found ack in backlog", zap.String("target", c), zap.String("cid", i.GetCID()))
					if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{c}); err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

func dispatchVisibleEvent(svc *service, i Interaction, tx *dbWrapper) error {
	// FIXME: check if app is in foreground
	// if conv is not open, increment the unread_count
	newUnread := !i.IsMe && svc.openedConversation.Load() != i.ConversationPublicKey

	// db update
	if err := tx.updateConversationReadState(i.ConversationPublicKey, newUnread, time.Now()); err != nil {
		return err
	}

	// expr-based (see above) gorm updates don't update the go object
	// next query could be easily replace by a simple increment, but this way we're 100% sure to be up-to-date
	conv, err := tx.getConversationByPK(i.GetConversationPublicKey())
	if err != nil {
		return err
	}

	// dispatch update event
	if err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conv}); err != nil {
		return err
	}

	return nil
}

func handleAppMessage(svc *service, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) error {
	appMessageHandlers := map[AppMessage_Type]struct {
		handler        func(svc *service, tx *dbWrapper, i Interaction, amPayload proto.Message) (Interaction, error)
		isVisibleEvent bool
	}{
		AppMessage_TypeAcknowledge:     {handleAppMessageAcknowledge, false},
		AppMessage_TypeGroupInvitation: {handleAppMessageGroupInvitation, true},
		AppMessage_TypeUserMessage:     {handleAppMessageUserMessage, true},
		AppMessage_TypeSetUserName:     {handleAppMessageSetUserName, false},
	}

	svc.logger.Info("handling app message", zap.String("type", am.GetType().String()))

	// build interaction
	i, err := interactionFromAppMessage(svc, gpk, gme, am)
	if err != nil {
		return err
	}

	if err := hydrateInteraction(svc, gme, &i); err != nil {
		return err
	}

	// parse payload
	amPayload, err := am.UnmarshalPayload()
	if err != nil {
		return err
	}

	// start a transaction
	return svc.db.tx(func(tx *dbWrapper) error {
		handler, ok := appMessageHandlers[i.GetType()]
		if !ok {
			svc.logger.Warn("unsupported app message type", zap.String("type", i.GetType().String()))

			return nil
		}

		i, err := handler.handler(svc, tx, i, amPayload)
		if err != nil {
			return err
		}

		if handler.isVisibleEvent {
			if err := dispatchVisibleEvent(svc, i, tx); err != nil {
				return err
			}
		}

		return nil
	})
}
