package bertymessenger

import (
	"context"
	"fmt"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type eventHandler struct {
	ctx                context.Context
	db                 *dbWrapper
	protocolClient     bertyprotocol.ProtocolServiceClient // TODO: on usage ensure meaningful calls
	logger             *zap.Logger
	svc                *service // TODO: on usage ensure not nil
	metadataHandlers   map[bertytypes.EventType]func(gme *bertytypes.GroupMetadataEvent) error
	appMessageHandlers map[AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *Interaction, amPayload proto.Message) (*Interaction, error)
		isVisibleEvent bool
	}
}

func newEventHandler(ctx context.Context, db *dbWrapper, protocolClient bertyprotocol.ProtocolServiceClient, logger *zap.Logger, svc *service) *eventHandler {
	if logger == nil {
		logger = zap.NewNop()
	}

	h := &eventHandler{
		ctx:            ctx,
		db:             db,
		protocolClient: protocolClient,
		logger:         logger,
		svc:            svc,
	}

	h.metadataHandlers = map[bertytypes.EventType]func(gme *bertytypes.GroupMetadataEvent) error{
		bertytypes.EventTypeAccountGroupJoined:                    h.accountGroupJoined,
		bertytypes.EventTypeAccountContactRequestOutgoingEnqueued: h.accountContactRequestOutgoingEnqueued,
		bertytypes.EventTypeAccountContactRequestOutgoingSent:     h.accountContactRequestOutgoingSent,
		bertytypes.EventTypeAccountContactRequestIncomingReceived: h.accountContactRequestIncomingReceived,
		bertytypes.EventTypeAccountContactRequestIncomingAccepted: h.accountContactRequestIncomingAccepted,
		bertytypes.EventTypeGroupMemberDeviceAdded:                h.groupMemberDeviceAdded,
		bertytypes.EventTypeGroupMetadataPayloadSent:              h.groupMetadataPayloadSent,
		bertytypes.EventTypeAccountServiceTokenAdded:              h.accountServiceTokenAdded,
	}

	h.appMessageHandlers = map[AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *Interaction, amPayload proto.Message) (*Interaction, error)
		isVisibleEvent bool
	}{
		AppMessage_TypeAcknowledge:     {h.handleAppMessageAcknowledge, false},
		AppMessage_TypeGroupInvitation: {h.handleAppMessageGroupInvitation, true},
		AppMessage_TypeUserMessage:     {h.handleAppMessageUserMessage, true},
		AppMessage_TypeSetUserName:     {h.handleAppMessageSetUserName, false},
	}

	return h
}

func (h *eventHandler) handleMetadataEvent(gme *bertytypes.GroupMetadataEvent) error {
	et := gme.GetMetadata().GetEventType()
	h.logger.Info("received protocol event", zap.String("type", et.String()))

	handler, ok := h.metadataHandlers[et]

	if !ok {
		h.logger.Info("event ignored", zap.String("type", et.String()))
		return nil
	}

	return handler(gme)
}

func (h *eventHandler) handleAppMessage(gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) error {
	h.logger.Info("handling app message", zap.String("type", am.GetType().String()))

	// build interaction
	i, err := interactionFromAppMessage(h, gpk, gme, am)
	if err != nil {
		return err
	}

	handler, ok := h.appMessageHandlers[i.GetType()]

	if !ok {
		h.logger.Warn("unsupported app message type", zap.String("type", i.GetType().String()))

		return nil
	}

	// start a transaction
	if err := h.db.tx(func(tx *dbWrapper) error {
		if err := h.interactionFetchRelations(tx, i); err != nil {
			return err
		}

		if err := h.interactionConsumeAck(tx, i); err != nil {
			return err
		}

		// parse payload
		amPayload, err := am.UnmarshalPayload()
		if err != nil {
			return err
		}

		i, err = handler.handler(tx, i, amPayload)
		if err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	if handler.isVisibleEvent {
		if err := h.dispatchVisibleInteraction(i); err != nil {
			h.logger.Error("unable to dispatch notification for interaction", zap.String("cid", i.CID), zap.Error(err))
		}
	}

	return nil
}

func (h *eventHandler) accountServiceTokenAdded(gme *bertytypes.GroupMetadataEvent) error {
	config, err := h.protocolClient.InstanceGetConfiguration(h.ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return err
	}

	var ev bertytypes.AccountServiceTokenAdded
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if err := h.db.addServiceToken(b64EncodeBytes(config.AccountPK), ev.ServiceToken); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	// dispatch event
	if h.svc != nil {
		acc, err := h.db.getAccount()
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeAccountUpdated, &StreamEvent_AccountUpdated{Account: acc}); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (h *eventHandler) groupMetadataPayloadSent(gme *bertytypes.GroupMetadataEvent) error {
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

	groupPK := b64EncodeBytes(gme.GetEventContext().GetGroupPK())

	return h.handleAppMessage(groupPK, &groupMessageEvent, &appMessage)
}

func (h *eventHandler) accountGroupJoined(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	gpkb := ev.GetGroup().GetPublicKey()
	groupPK := b64EncodeBytes(gpkb)

	conversation, err := h.db.addConversation(groupPK)

	switch {
	case errcode.Is(err, errcode.ErrDBEntryAlreadyExists):
		h.logger.Info("conversation already in db")
	case err != nil:
		return errcode.ErrDBAddConversation.Wrap(err)
	default:
		h.logger.Info("saved conversation in db")

		// dispatch event
		if h.svc != nil {
			if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conversation}); err != nil {
				return err
			}
		}
	}

	// activate group
	if h.svc != nil {
		if _, err := h.protocolClient.ActivateGroup(h.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb}); err != nil {
			h.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(gpkb)))
		}

		// subscribe to group
		if err := h.svc.subscribeToGroup(gpkb); err != nil {
			return err
		}

		h.logger.Info("AccountGroupJoined", zap.String("pk", groupPK), zap.String("known-as", conversation.GetDisplayName()))
	}

	return nil
}

func (h *eventHandler) accountContactRequestOutgoingEnqueued(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPKBytes := ev.GetContact().GetPK()
	contactPK := b64EncodeBytes(contactPKBytes)

	var cm ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		return err
	}

	gpk := b64EncodeBytes(ev.GetGroupPK())
	if gpk == "" {
		groupInfoReply, err := h.protocolClient.GroupInfo(h.ctx, &bertytypes.GroupInfo_Request{ContactPK: contactPKBytes})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		gpk = b64EncodeBytes(groupInfoReply.GetGroup().GetPublicKey())
	}

	contact, err := h.db.addContactRequestOutgoingEnqueued(contactPK, cm.DisplayName, gpk)
	if errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return nil
	} else if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingEnqueud.Wrap(err)
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact}); err != nil {
			return err
		}
	}

	return nil
}

func (h *eventHandler) accountContactRequestOutgoingSent(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPK := b64EncodeBytes(ev.GetContactPK())

	contact, err := h.db.addContactRequestOutgoingSent(contactPK)
	if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
	}

	// dispatch event and subscribe to group metadata
	if h.svc != nil {
		err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
		if err != nil {
			return err
		}

		groupPK, err := groupPKFromContactPK(h.ctx, h.protocolClient, ev.GetContactPK())
		if err != nil {
			return err
		}

		if _, err = h.protocolClient.ActivateGroup(h.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		return h.svc.subscribeToMetadata(groupPK)
	}

	return nil
}

func (h *eventHandler) accountContactRequestIncomingReceived(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	contactPK := b64EncodeBytes(ev.GetContactPK())

	var m ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		return err
	}

	contact, err := h.db.addContactRequestIncomingReceived(contactPK, m.GetDisplayName())
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
	}

	if h.svc != nil {
		return h.svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
	}

	return nil
}

func (h *eventHandler) accountContactRequestIncomingAccepted(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestAccepted
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	if len(ev.GetContactPK()) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact pk is empty"))
	}
	contactPK := b64EncodeBytes(ev.GetContactPK())

	groupPK, err := groupPKFromContactPK(h.ctx, h.protocolClient, ev.GetContactPK())
	if err != nil {
		return err
	}

	contact, conversation, err := h.db.addContactRequestIncomingAccepted(contactPK, b64EncodeBytes(groupPK))
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
	}

	if h.svc != nil {
		// dispatch event to subscribers
		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact}); err != nil {
			return err
		}

		if err = h.svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conversation}); err != nil {
			return err
		}

		// activate group
		if _, err := h.protocolClient.ActivateGroup(h.svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		// subscribe to group messages
		return h.svc.subscribeToGroup(groupPK)
	}

	return nil
}

func (h *eventHandler) contactRequestAccepted(contact *Contact, memberPK []byte) error {
	// someone you invited just accepted the invitation
	// update contact
	var groupPK []byte
	{
		var err error
		if groupPK, err = groupPKFromContactPK(h.ctx, h.protocolClient, memberPK); err != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("can't get group public key for contact %w", err))
		}

		contact.State = Contact_Accepted
		contact.ConversationPublicKey = b64EncodeBytes(groupPK)
	}

	// create new contact conversation
	var conversation *Conversation

	// update db
	if err := h.db.tx(func(tx *dbWrapper) error {
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

	if h.svc != nil {
		// dispatch events
		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact}); err != nil {
			return err
		}

		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conversation}); err != nil {
			return err
		}

		// activate group and subscribe to message events
		if _, err := h.protocolClient.ActivateGroup(h.svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		return h.svc.subscribeToMessages(groupPK)
	}

	return nil
}

// groupMemberDeviceAdded is called at different moments
// * on AccountGroup when you add a new device to your group
// * on ContactGroup when you or your contact add a new device
// * on MultiMemberGroup when you or anyone in a multimember group adds a new device
func (h *eventHandler) groupMemberDeviceAdded(gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.GroupAddMemberDevice
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	mpkb := ev.GetMemberPK()
	dpkb := ev.GetDevicePK()
	gpkb := gme.GetEventContext().GetGroupPK()

	if mpkb == nil || dpkb == nil || gpkb == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("some metadata event references are missing"))
	}

	mpk := b64EncodeBytes(mpkb)
	dpk := b64EncodeBytes(dpkb)
	gpk := b64EncodeBytes(gpkb)

	// Ensure the event has is not emitted by the current user
	if isMe, err := checkIsMe(
		h.ctx,
		h.protocolClient,
		&bertytypes.GroupMessageEvent{
			EventContext: gme.GetEventContext(),
			Headers:      &bertytypes.MessageHeaders{DevicePK: dpkb},
		},
	); err != nil {
		return err
	} else if isMe {
		h.logger.Debug("ignoring member device because isMe")
		return nil
	}

	// Register device if not already known
	if _, err := h.db.getDeviceByPK(dpk); err == gorm.ErrRecordNotFound {
		device, err := h.db.addDevice(dpk, mpk)
		if err != nil {
			return err
		}

		if h.svc != nil {
			err = h.svc.dispatcher.StreamEvent(StreamEvent_TypeDeviceUpdated, &StreamEvent_DeviceUpdated{Device: device})
			if err != nil {
				h.logger.Error("error dispatching device updated", zap.Error(err))
			}
		}
	}

	// Check whether a contact request has been accepted (a device from the contact has been added to the group)
	if contact, err := h.db.getContactByPK(mpk); err == nil && contact.GetState() == Contact_OutgoingRequestSent {
		if err := h.contactRequestAccepted(contact, mpkb); err != nil {
			return err
		}
	}

	// check backlogs
	{
		backlog, err := h.db.attributeBacklogInteractions(dpk, gpk, mpk)
		if err != nil {
			return err
		}

		displayName := ""

		for _, elem := range backlog {
			h.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), zap.String("device-pk", elem.GetDevicePublicKey()), zap.String("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case AppMessage_TypeSetUserName:
				var payload AppMessage_SetUserName

				if err := proto.Unmarshal(elem.GetPayload(), &payload); err != nil {
					return err
				}

				displayName = payload.GetName()

				if err := h.db.deleteInteractions([]string{elem.CID}); err != nil {
					return err
				}

				if h.svc != nil {
					if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{elem.GetCID()}); err != nil {
						return err
					}
				}

			default:
				if h.svc != nil {
					if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{elem}); err != nil {
						return err
					}
				}
			}
		}

		member, err := h.db.addMember(mpk, gpk, displayName)
		if err != nil {
			return err
		}

		if h.svc != nil {
			err = h.svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{member})
			if err != nil {
				return err
			}

			h.logger.Info("dispatched member update", zap.String("name", member.GetDisplayName()), zap.String("conv", gpk))
		}
	}

	return nil
}

func (h *eventHandler) handleAppMessageAcknowledge(tx *dbWrapper, i *Interaction, amPayload proto.Message) (*Interaction, error) {
	payload := amPayload.(*AppMessage_Acknowledge)
	target, err := tx.markInteractionAsAcknowledged(payload.Target)

	switch {
	case err == gorm.ErrRecordNotFound:
		h.logger.Debug("added ack in backlog", zap.String("target", payload.GetTarget()), zap.String("cid", i.GetCID()))
		i.TargetCID = payload.Target
		i, err = tx.addInteraction(*i, false)
		if err != nil {
			return nil, err
		}

		return i, nil

	case err != nil:
		return nil, err

	default:
		if target != nil && h.svc != nil {
			if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{target}); err != nil {
				h.logger.Error("error while sending stream event", zap.String("public-key", i.ConversationPublicKey), zap.String("cid", i.CID), zap.Error(err))
			}
		}

		return i, nil
	}
}

func (h *eventHandler) handleAppMessageGroupInvitation(tx *dbWrapper, i *Interaction, _ proto.Message) (*Interaction, error) {
	i, err := tx.addInteraction(*i, false)
	if err != nil {
		return nil, err
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i}); err != nil {
			return nil, err
		}
	}

	return i, err
}

func (h *eventHandler) handleAppMessageUserMessage(tx *dbWrapper, i *Interaction, amPayload proto.Message) (*Interaction, error) {
	i, err := tx.addInteraction(*i, false)
	if err != nil {
		return nil, err
	}

	if h.svc == nil {
		return i, nil
	}

	if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i}); err != nil {
		return nil, err
	}

	if i.IsMe {
		return i, nil
	}

	if err := h.sendAck(i.CID, i.ConversationPublicKey); err != nil {
		h.logger.Error("error while sending ack", zap.String("public-key", i.ConversationPublicKey), zap.String("cid", i.CID), zap.Error(err))
	}

	// notify
	// FIXME: also notify if app is in background
	isOpened, err := tx.isConversationOpened(i.ConversationPublicKey)
	if err != nil {
		return nil, err
	}

	// Receiving a message for an opened conversation returning early
	// Receiving a message for a conversation not known yet, returning early
	if isOpened || i.Conversation == nil {
		return i, nil
	}

	// fetch contact from db
	var contact *Contact
	if i.Conversation.Type == Conversation_ContactType {
		if contact, err = tx.getContactByPK(i.Conversation.ContactPublicKey); err != nil {
			h.logger.Warn("1to1 message contact not found", zap.String("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
		}
	}

	payload := amPayload.(*AppMessage_UserMessage)
	var title string
	body := payload.GetBody()
	if contact != nil && i.Conversation.Type == Conversation_ContactType {
		title = contact.GetDisplayName()
	} else {
		title = i.Conversation.GetDisplayName()
		memberName := i.Member.GetDisplayName()
		if memberName != "" {
			body = memberName + ": " + payload.GetBody()
		}
	}

	msgRecvd := StreamEvent_Notified_MessageReceived{Interaction: i, Conversation: i.Conversation, Contact: contact}
	err = h.svc.dispatcher.Notify(StreamEvent_Notified_TypeMessageReceived, title, body, &msgRecvd)

	if err != nil {
		h.logger.Error("failed to notify", zap.Error(err))
	}

	return i, nil
}

func (h *eventHandler) handleAppMessageSetUserName(tx *dbWrapper, i *Interaction, amPayload proto.Message) (*Interaction, error) {
	if i.IsMe {
		h.logger.Info("ignoring SetUserName because isMe")
		return i, nil
	}

	h.logger.Debug("interesting SetUserName")

	payload := amPayload.(*AppMessage_SetUserName)

	if i.MemberPublicKey == "" {
		// store in backlog
		h.logger.Info("storing SetUserName in backlog", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))
		return tx.addInteraction(*i, true)
	}

	member, err := tx.addMember(i.MemberPublicKey, i.ConversationPublicKey, payload.GetName())
	if err != nil {
		return i, err
	}

	if h.svc != nil {
		err = h.svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{Member: member})
		if err != nil {
			return i, err
		}

		h.logger.Debug("dispatched member update", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))
	}

	return i, nil
}

func interactionFromAppMessage(h *eventHandler, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) (*Interaction, error) {
	amt := am.GetType()
	cidb := gme.GetEventContext().GetID()
	cid := b64EncodeBytes(cidb)
	isMe, err := checkIsMe(h.ctx, h.protocolClient, gme)
	if err != nil {
		return nil, err
	}

	dpkb := gme.GetHeaders().GetDevicePK()
	dpk := b64EncodeBytes(dpkb)

	h.logger.Debug("received app message", zap.String("type", amt.String()))

	return &Interaction{
		CID:                   cid,
		Type:                  amt,
		Payload:               am.GetPayload(),
		IsMe:                  isMe,
		ConversationPublicKey: gpk,
		SentDate:              am.GetSentDate(),
		DevicePublicKey:       dpk,
	}, nil
}

func (h *eventHandler) interactionFetchRelations(tx *dbWrapper, i *Interaction) error {
	// fetch conv from db
	if conversation, err := tx.getConversationByPK(i.ConversationPublicKey); err != nil {
		h.logger.Warn("conversation related to interaction not found")
	} else {
		i.Conversation = conversation

		if i.Conversation.Type == Conversation_MultiMemberType {
			// fetch member from db
			member, err := tx.getMemberByPK(i.MemberPublicKey)
			if err != nil {
				h.logger.Warn("multimember message member not found", zap.String("public-key", i.MemberPublicKey), zap.Error(err))
			}

			i.Member = member
		}
	}

	// build device
	switch {
	case i.IsMe: // myself
		i.MemberPublicKey = ""

	case i.Conversation != nil && i.Conversation.GetType() == Conversation_ContactType: // 1-1 conversation
		i.MemberPublicKey = ""
		// FIXME: multiple devices per contact?

	default:
		existingDevice, err := tx.getDeviceByPK(i.DevicePublicKey)
		if err == nil { // device already exists
			i.MemberPublicKey = existingDevice.GetMemberPublicKey()
		} else { // device not found
			i.MemberPublicKey = "" // backlog magic
		}
	}

	return nil
}

func (h *eventHandler) dispatchVisibleInteraction(i *Interaction) error {
	if h.svc == nil {
		return nil
	}

	return h.db.tx(func(tx *dbWrapper) error {
		// FIXME: check if app is in foreground
		// if conv is not open, increment the unread_count
		opened, err := tx.isConversationOpened(i.ConversationPublicKey)
		if err != nil {
			return err
		}

		newUnread := !i.IsMe && !opened

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
		if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conv}); err != nil {
			return err
		}

		return nil
	})
}

func (h *eventHandler) sendAck(cid, conversationPK string) error {
	h.logger.Debug("sending ack", zap.String("target", cid))

	// Don't send ack if message is already acked to prevent spam in multimember groups
	// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
	amp, err := AppMessage_TypeAcknowledge.MarshalPayload(0, &AppMessage_Acknowledge{Target: cid})
	if err != nil {
		return err
	}

	cpk, err := b64DecodeBytes(conversationPK)
	if err != nil {
		return err
	}

	if _, err = h.protocolClient.AppMessageSend(h.ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: cpk,
		Payload: amp,
	}); err != nil {
		return err
	}

	return nil
}

func (h *eventHandler) interactionConsumeAck(tx *dbWrapper, i *Interaction) error {
	cids, err := tx.getAcknowledgementsCIDsForInteraction(i.CID)
	if err != nil {
		return err
	}

	if len(cids) == 0 {
		return nil
	}

	i.Acknowledged = true

	if err := tx.deleteInteractions(cids); err != nil {
		return err
	}

	if h.svc != nil {
		for _, c := range cids {
			h.logger.Debug("found ack in backlog", zap.String("target", c), zap.String("cid", i.GetCID()))
			if err := h.svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{c}); err != nil {
				return err
			}
		}
	}

	return nil
}
