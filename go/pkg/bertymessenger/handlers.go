package bertymessenger

import (
	"bytes"
	"context"
	"fmt"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type eventHandler struct {
	ctx                context.Context
	db                 *dbWrapper
	protocolClient     protocoltypes.ProtocolServiceClient // TODO: on usage ensure meaningful calls
	logger             *zap.Logger
	svc                *service // TODO: on usage ensure not nil
	metadataHandlers   map[protocoltypes.EventType]func(gme *protocoltypes.GroupMetadataEvent) error
	replay             bool
	appMessageHandlers map[messengertypes.AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *messengertypes.Interaction, amPayload proto.Message) (*messengertypes.Interaction, bool, error)
		isVisibleEvent bool
	}
}

func newEventHandler(ctx context.Context, db *dbWrapper, protocolClient protocoltypes.ProtocolServiceClient, logger *zap.Logger, svc *service, replay bool) *eventHandler {
	if logger == nil {
		logger = zap.NewNop()
	}

	h := &eventHandler{
		ctx:            ctx,
		db:             db,
		protocolClient: protocolClient,
		logger:         logger,
		svc:            svc,
		replay:         replay,
	}

	h.metadataHandlers = map[protocoltypes.EventType]func(gme *protocoltypes.GroupMetadataEvent) error{
		protocoltypes.EventTypeAccountGroupJoined:                     h.accountGroupJoined,
		protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued:  h.accountContactRequestOutgoingEnqueued,
		protocoltypes.EventTypeAccountContactRequestOutgoingSent:      h.accountContactRequestOutgoingSent,
		protocoltypes.EventTypeAccountContactRequestIncomingReceived:  h.accountContactRequestIncomingReceived,
		protocoltypes.EventTypeAccountContactRequestIncomingAccepted:  h.accountContactRequestIncomingAccepted,
		protocoltypes.EventTypeGroupMemberDeviceAdded:                 h.groupMemberDeviceAdded,
		protocoltypes.EventTypeGroupMetadataPayloadSent:               h.groupMetadataPayloadSent,
		protocoltypes.EventTypeAccountServiceTokenAdded:               h.accountServiceTokenAdded,
		protocoltypes.EventTypeGroupReplicating:                       h.groupReplicating,
		protocoltypes.EventTypeMultiMemberGroupInitialMemberAnnounced: h.multiMemberGroupInitialMemberAnnounced,
	}

	h.appMessageHandlers = map[messengertypes.AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *messengertypes.Interaction, amPayload proto.Message) (*messengertypes.Interaction, bool, error)
		isVisibleEvent bool
	}{
		messengertypes.AppMessage_TypeAcknowledge:     {h.handleAppMessageAcknowledge, false},
		messengertypes.AppMessage_TypeGroupInvitation: {h.handleAppMessageGroupInvitation, true},
		messengertypes.AppMessage_TypeUserMessage:     {h.handleAppMessageUserMessage, true},
		messengertypes.AppMessage_TypeSetUserInfo:     {h.handleAppMessageSetUserInfo, false},
		messengertypes.AppMessage_TypeReplyOptions:    {h.handleAppMessageReplyOptions, true},
	}

	return h
}

func (h *eventHandler) handleMetadataEvent(gme *protocoltypes.GroupMetadataEvent) error {
	et := gme.GetMetadata().GetEventType()
	h.logger.Info("received protocol event", zap.String("type", et.String()))

	handler, ok := h.metadataHandlers[et]

	if !ok {
		h.logger.Info("event ignored", zap.String("type", et.String()))
		return nil
	}

	return handler(gme)
}

func (h *eventHandler) handleAppMessage(gpk string, gme *protocoltypes.GroupMessageEvent, am *messengertypes.AppMessage) error {
	if am.GetType() != messengertypes.AppMessage_TypeAcknowledge {
		h.logger.Info("handling app message", zap.String("type", am.GetType().String()))
	}

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

	medias := i.GetMedias()
	var mediasAdded []bool

	// start a transaction
	var isNew bool
	if err := h.db.tx(func(tx *dbWrapper) error {
		if mediasAdded, err = tx.addMedias(medias); err != nil {
			return err
		}

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

		i, isNew, err = handler.handler(tx, i, amPayload)
		if err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	if handler.isVisibleEvent && isNew {
		if err := h.dispatchVisibleInteraction(i); err != nil {
			h.logger.Error("unable to dispatch notification for interaction", zap.String("cid", i.CID), zap.Error(err))
		}
	}

	for i, media := range medias {
		if mediasAdded[i] {
			if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMediaUpdated, &messengertypes.StreamEvent_MediaUpdated{Media: media}, true); err != nil {
				h.logger.Error("unable to dispatch notification for media", zap.String("cid", media.CID), zap.Error(err))
			}
		}
	}

	return nil
}

func (h *eventHandler) accountServiceTokenAdded(gme *protocoltypes.GroupMetadataEvent) error {
	config, err := h.protocolClient.InstanceGetConfiguration(h.ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return err
	}

	var ev protocoltypes.AccountServiceTokenAdded
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

		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (h *eventHandler) groupReplicating(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.GroupReplicating
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	cid, err := ipfscid.Cast(gme.GetEventContext().GetID())
	if err != nil {
		return err
	}

	convPK := b64EncodeBytes(gme.EventContext.GroupPK)

	if err := h.db.saveConversationReplicationInfo(messengertypes.ConversationReplicationInfo{
		CID:                   cid.String(),
		ConversationPublicKey: convPK,
		MemberPublicKey:       "", // TODO
		AuthenticationURL:     ev.AuthenticationURL,
		ReplicationServer:     ev.ReplicationServer,
	}); err != nil {
		return err
	}

	if h.svc == nil {
		return nil
	}

	if conv, err := h.db.getConversationByPK(convPK); err != nil {
		h.logger.Warn("unknown conversation", zap.String("conversation-pk", convPK))
	} else if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return err
	}

	return nil
}

func (h *eventHandler) groupMetadataPayloadSent(gme *protocoltypes.GroupMetadataEvent) error {
	var appMetadata protocoltypes.AppMetadata
	if err := proto.Unmarshal(gme.GetEvent(), &appMetadata); err != nil {
		return err
	}

	var appMessage messengertypes.AppMessage
	if err := proto.Unmarshal(appMetadata.GetMessage(), &appMessage); err != nil {
		return err
	}

	groupMessageEvent := protocoltypes.GroupMessageEvent{
		EventContext: gme.GetEventContext(),
		Message:      appMetadata.GetMessage(),
		Headers:      &protocoltypes.MessageHeaders{DevicePK: appMetadata.GetDevicePK()},
	}

	groupPK := b64EncodeBytes(gme.GetEventContext().GetGroupPK())

	return h.handleAppMessage(groupPK, &groupMessageEvent, &appMessage)
}

func (h *eventHandler) accountGroupJoined(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountGroupJoined
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
			if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
				return err
			}
		}
	}

	// activate group
	if h.svc != nil {
		if _, err := h.protocolClient.ActivateGroup(h.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: gpkb}); err != nil {
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

func (h *eventHandler) accountContactRequestOutgoingEnqueued(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPKBytes := ev.GetContact().GetPK()
	contactPK := b64EncodeBytes(contactPKBytes)

	var cm messengertypes.ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		return err
	}

	gpk := b64EncodeBytes(ev.GetGroupPK())
	if gpk == "" {
		groupInfoReply, err := h.protocolClient.GroupInfo(h.ctx, &protocoltypes.GroupInfo_Request{ContactPK: contactPKBytes})
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

	// create new contact conversation
	var conversation *messengertypes.Conversation

	// update db
	if err := h.db.tx(func(tx *dbWrapper) error {
		var err error

		// create new conversation
		if conversation, err = tx.addConversationForContact(contact.ConversationPublicKey, contact.PublicKey); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
			return err
		}

		if err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
			return err
		}
	}

	return nil
}

func (h *eventHandler) accountContactRequestOutgoingSent(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestSent
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
		err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: contact}, false)
		if err != nil {
			return err
		}

		err = h.svc.dispatcher.Notify(
			messengertypes.StreamEvent_Notified_TypeContactRequestSent,
			"Contact request sent",
			"To: "+contact.GetDisplayName(),
			&messengertypes.StreamEvent_Notified_ContactRequestSent{Contact: contact},
		)
		if err != nil {
			h.logger.Warn("failed to notify", zap.Error(err))
		}

		groupPK, err := groupPKFromContactPK(h.ctx, h.protocolClient, ev.GetContactPK())
		if err != nil {
			return err
		}

		if _, err = h.protocolClient.ActivateGroup(h.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		if err := h.svc.sendAccountUserInfo(b64EncodeBytes(groupPK)); err != nil {
			h.svc.logger.Error("failed to set user info after outgoing request sent", zap.Error(err))
		}

		return h.svc.subscribeToMetadata(groupPK)
	}

	return nil
}

func (h *eventHandler) accountContactRequestIncomingReceived(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	contactPK := b64EncodeBytes(ev.GetContactPK())

	var m messengertypes.ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		return err
	}

	groupPK, err := groupPKFromContactPK(h.ctx, h.protocolClient, ev.GetContactPK())
	if err != nil {
		return err
	}
	groupPKBytes := b64EncodeBytes(groupPK)

	contact, err := h.db.addContactRequestIncomingReceived(contactPK, m.GetDisplayName(), groupPKBytes)
	if errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return nil
	} else if err != nil {
		return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
	}

	// create new contact conversation
	var conversation *messengertypes.Conversation

	// update db
	if err := h.db.tx(func(tx *dbWrapper) error {
		var err error

		// create new conversation
		if conversation, err = tx.addConversationForContact(groupPKBytes, contactPK); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
			return err
		}

		if err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
			return err
		}

		err = h.svc.dispatcher.Notify(
			messengertypes.StreamEvent_Notified_TypeContactRequestReceived,
			"Contact request received",
			"From: "+contact.GetDisplayName(),
			&messengertypes.StreamEvent_Notified_ContactRequestReceived{Contact: contact},
		)
		if err != nil {
			h.logger.Warn("failed to notify", zap.Error(err))
		}
	}

	return nil
}

func (h *eventHandler) accountContactRequestIncomingAccepted(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestAccepted
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

	contact, err := h.db.addContactRequestIncomingAccepted(contactPK, b64EncodeBytes(groupPK))
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
	}

	if h.svc != nil {
		// dispatch event to subscribers
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
			return err
		}

		// activate group
		if _, err := h.protocolClient.ActivateGroup(h.svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		if err := h.svc.sendAccountUserInfo(b64EncodeBytes(groupPK)); err != nil {
			h.svc.logger.Error("failed to set user info after incoming request accepted", zap.Error(err))
		}

		// subscribe to group messages
		return h.svc.subscribeToGroup(groupPK)
	}

	return nil
}

func (h *eventHandler) contactRequestAccepted(contact *messengertypes.Contact, memberPK []byte) error {
	// someone you invited just accepted the invitation
	// update contact
	var groupPK []byte
	{
		var err error
		if groupPK, err = groupPKFromContactPK(h.ctx, h.protocolClient, memberPK); err != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("can't get group public key for contact %w", err))
		}

		contact.State = messengertypes.Contact_Accepted
		contact.ConversationPublicKey = b64EncodeBytes(groupPK)
	}

	// update db
	if err := h.db.tx(func(tx *dbWrapper) error {
		var err error

		// update existing contact
		if err = tx.updateContact(contact.GetPublicKey(), *contact); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	if h.svc != nil {
		// dispatch events
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
			return err
		}

		// activate group and subscribe to message events
		if _, err := h.protocolClient.ActivateGroup(h.svc.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		return h.svc.subscribeToMessages(groupPK)
	}

	return nil
}

func (h *eventHandler) multiMemberGroupInitialMemberAnnounced(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.MultiMemberInitialMember
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	mpkb := ev.GetMemberPK()
	mpk := b64EncodeBytes(mpkb)
	gpkb := gme.GetEventContext().GetGroupPK()
	gpk := b64EncodeBytes(gpkb)

	if err := h.db.tx(func(tx *dbWrapper) error {
		// create or update member

		member, err := tx.getMemberByPK(mpk, gpk)
		if err != gorm.ErrRecordNotFound && err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if err == gorm.ErrRecordNotFound {
			gi, err := h.protocolClient.GroupInfo(h.ctx, &protocoltypes.GroupInfo_Request{GroupPK: gpkb})
			if err != nil {
				return errcode.ErrGroupInfo.Wrap(err)
			}
			isMe := bytes.Equal(gi.GetMemberPK(), mpkb)

			if _, err := tx.addMember(mpk, gpk, "", "", isMe, true); err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}
		} else {
			member.IsCreator = true
			if err := tx.db.Save(member).Error; err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}
		}

		return nil
	}); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	// dispatch update
	{
		member, err := h.db.getMemberByPK(mpk, gpk)
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if h.svc != nil {
			err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMemberUpdated, &messengertypes.StreamEvent_MemberUpdated{Member: member}, true)
			if err != nil {
				return err
			}

			h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", true))
		}
	}

	return nil
}

// groupMemberDeviceAdded is called at different moments
// * on AccountGroup when you add a new device to your group
// * on ContactGroup when you or your contact add a new device
// * on MultiMemberGroup when you or anyone in a multimember group adds a new device
func (h *eventHandler) groupMemberDeviceAdded(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.GroupAddMemberDevice
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

	// Check if the event is emitted by the current user
	gi, err := h.protocolClient.GroupInfo(h.ctx, &protocoltypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return errcode.ErrGroupInfo.Wrap(err)
	}
	isMe := bytes.Equal(gi.GetMemberPK(), mpkb)

	// Register device if not already known
	if _, err := h.db.getDeviceByPK(dpk); err == gorm.ErrRecordNotFound {
		device, err := h.db.addDevice(dpk, mpk)
		if err != nil {
			return err
		}

		if h.svc != nil {
			err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeDeviceUpdated, &messengertypes.StreamEvent_DeviceUpdated{Device: device}, true)
			if err != nil {
				h.logger.Error("error dispatching device updated", zap.Error(err))
			}
		}
	}

	// Check whether a contact request has been accepted (a device from the contact has been added to the group)
	if contact, err := h.db.getContactByPK(mpk); err == nil && contact.GetState() == messengertypes.Contact_OutgoingRequestSent {
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

		userInfo := (*messengertypes.AppMessage_SetUserInfo)(nil)

		for _, elem := range backlog {
			h.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), zap.String("device-pk", elem.GetDevicePublicKey()), zap.String("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case messengertypes.AppMessage_TypeSetUserInfo:
				var payload messengertypes.AppMessage_SetUserInfo

				if err := proto.Unmarshal(elem.GetPayload(), &payload); err != nil {
					return err
				}

				userInfo = &payload

				if err := h.db.deleteInteractions([]string{elem.CID}); err != nil {
					return err
				}

				if h.svc != nil {
					if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionDeleted, &messengertypes.StreamEvent_InteractionDeleted{CID: elem.GetCID()}, false); err != nil {
						return err
					}
				}

			default:
				if h.svc != nil {
					if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionUpdated, &messengertypes.StreamEvent_InteractionUpdated{Interaction: elem}, false); err != nil {
						return err
					}
				}
			}
		}

		member, isNew, err := h.db.upsertMember(mpk, gpk, messengertypes.Member{
			PublicKey:             mpk,
			ConversationPublicKey: gpk,
			DisplayName:           userInfo.GetDisplayName(),
			AvatarCID:             userInfo.GetAvatarCID(),
			IsMe:                  isMe,
		})
		if err != nil {
			return err
		}

		if h.svc != nil {
			err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMemberUpdated, &messengertypes.StreamEvent_MemberUpdated{Member: member}, isNew)
			if err != nil {
				return err
			}

			h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))
		}
	}

	return nil
}

func (h *eventHandler) handleAppMessageAcknowledge(tx *dbWrapper, i *messengertypes.Interaction, amPayload proto.Message) (*messengertypes.Interaction, bool, error) {
	payload := amPayload.(*messengertypes.AppMessage_Acknowledge)
	target, err := tx.markInteractionAsAcknowledged(payload.Target)

	switch {
	case err == gorm.ErrRecordNotFound:
		h.logger.Debug("added ack in backlog", zap.String("target", payload.GetTarget()), zap.String("cid", i.GetCID()))
		i.TargetCID = payload.Target
		i, _, err = tx.addInteraction(*i)
		if err != nil {
			return nil, false, err
		}

		return i, false, nil

	case err != nil:
		return nil, false, err

	default:
		if target != nil && h.svc != nil {
			if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionUpdated, &messengertypes.StreamEvent_InteractionUpdated{Interaction: target}, false); err != nil {
				h.logger.Error("error while sending stream event", zap.String("public-key", i.ConversationPublicKey), zap.String("cid", i.CID), zap.Error(err))
			}
		}

		return i, false, nil
	}
}

func (h *eventHandler) handleAppMessageGroupInvitation(tx *dbWrapper, i *messengertypes.Interaction, _ proto.Message) (*messengertypes.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionUpdated, &messengertypes.StreamEvent_InteractionUpdated{Interaction: i}, isNew); err != nil {
			return nil, isNew, err
		}
	}

	return i, isNew, err
}

func (h *eventHandler) handleAppMessageUserMessage(tx *dbWrapper, i *messengertypes.Interaction, amPayload proto.Message) (*messengertypes.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc == nil {
		return i, isNew, nil
	}

	if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionUpdated, &messengertypes.StreamEvent_InteractionUpdated{Interaction: i}, isNew); err != nil {
		return nil, isNew, err
	}

	if i.IsMine || h.replay || !isNew {
		return i, isNew, nil
	}

	if err := h.sendAck(i.CID, i.ConversationPublicKey); err != nil {
		h.logger.Error("error while sending ack", zap.String("public-key", i.ConversationPublicKey), zap.String("cid", i.CID), zap.Error(err))
	}

	// notify

	// Receiving a message for an opened conversation returning early
	// Receiving a message for a conversation not known yet, returning early
	if i.Conversation == nil {
		return i, isNew, nil
	}

	// fetch contact from db
	var contact *messengertypes.Contact
	if i.Conversation.Type == messengertypes.Conversation_ContactType {
		if contact, err = tx.getContactByPK(i.Conversation.ContactPublicKey); err != nil {
			h.logger.Warn("1to1 message contact not found", zap.String("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
		}
	}

	payload := amPayload.(*messengertypes.AppMessage_UserMessage)
	var title string
	body := payload.GetBody()
	if contact != nil && i.Conversation.Type == messengertypes.Conversation_ContactType {
		title = contact.GetDisplayName()
	} else {
		title = i.Conversation.GetDisplayName()
		memberName := i.Member.GetDisplayName()
		if memberName != "" {
			body = memberName + ": " + payload.GetBody()
		}
	}

	msgRecvd := messengertypes.StreamEvent_Notified_MessageReceived{
		Interaction:  i,
		Conversation: i.Conversation,
		Contact:      contact,
	}
	err = h.svc.dispatcher.Notify(messengertypes.StreamEvent_Notified_TypeMessageReceived, title, body, &msgRecvd)

	if err != nil {
		h.logger.Error("failed to notify", zap.Error(err))
	}

	return i, isNew, nil
}

func (h *eventHandler) handleAppMessageSetUserInfo(tx *dbWrapper, i *messengertypes.Interaction, amPayload proto.Message) (*messengertypes.Interaction, bool, error) {
	payload := amPayload.(*messengertypes.AppMessage_SetUserInfo)

	if i.GetConversation().GetType() == messengertypes.Conversation_ContactType {
		if i.GetIsMine() {
			return i, false, nil
		}

		cpk := i.GetConversation().GetContactPublicKey()
		c, err := tx.getContactByPK(cpk)
		if err != nil {
			return nil, false, err
		}

		if c.GetInfoDate() > i.GetSentDate() {
			return i, false, nil
		}
		h.logger.Debug("interesting contact SetUserInfo")

		c.DisplayName = payload.GetDisplayName()
		c.AvatarCID = payload.GetAvatarCID()
		err = tx.updateContact(cpk, messengertypes.Contact{DisplayName: c.GetDisplayName(), AvatarCID: c.GetAvatarCID(), InfoDate: i.GetSentDate()})
		if err != nil {
			return nil, false, err
		}

		c, err = tx.getContactByPK(i.GetConversation().GetContactPublicKey())
		if err != nil {
			return nil, false, err
		}

		if h.svc != nil {
			err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeContactUpdated, &messengertypes.StreamEvent_ContactUpdated{Contact: c}, false)
			if err != nil {
				return nil, false, err
			}
			h.logger.Debug("dispatched contact update", zap.String("name", c.GetDisplayName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))
		}

		return i, false, nil
	}

	if i.MemberPublicKey == "" {
		// store in backlog
		h.logger.Info("storing SetUserInfo in backlog", zap.String("name", payload.GetDisplayName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", i.ConversationPublicKey))
		ni, isNew, err := tx.addInteraction(*i)
		if err != nil {
			return nil, false, err
		}
		return ni, isNew, nil
	}

	isNew := false
	existingMember, err := tx.getMemberByPK(i.MemberPublicKey, i.ConversationPublicKey)
	if err == gorm.ErrRecordNotFound {
		isNew = true
	} else if err != nil {
		return nil, false, err
	}

	if !isNew && existingMember.GetInfoDate() > i.GetSentDate() {
		return i, false, nil
	}
	h.logger.Debug("interesting member SetUserInfo")

	member, isNew, err := tx.upsertMember(
		i.MemberPublicKey,
		i.ConversationPublicKey,
		messengertypes.Member{DisplayName: payload.GetDisplayName(), AvatarCID: payload.GetAvatarCID(), InfoDate: i.GetSentDate()},
	)
	if err != nil {
		return nil, false, err
	}

	if h.svc != nil {
		err = h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeMemberUpdated, &messengertypes.StreamEvent_MemberUpdated{Member: member}, isNew)
		if err != nil {
			return nil, false, err
		}

		h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))
	}

	return i, false, nil
}

func interactionFromAppMessage(h *eventHandler, gpk string, gme *protocoltypes.GroupMessageEvent, am *messengertypes.AppMessage) (*messengertypes.Interaction, error) {
	amt := am.GetType()
	cid, err := ipfscid.Cast(gme.GetEventContext().GetID())
	if err != nil {
		return nil, err
	}

	isMe, err := checkDeviceIsMe(h.ctx, h.protocolClient, gme)
	if err != nil {
		return nil, err
	}

	dpkb := gme.GetHeaders().GetDevicePK()
	dpk := b64EncodeBytes(dpkb)

	mpk, err := h.db.getMemberPKFromDevicePK(dpk)
	if err != nil {
		h.logger.Error("failed to get memberPK from devicePK", zap.Error(err), zap.Bool("is-me", isMe), zap.String("device-pk", dpk), zap.String("group", gpk), zap.Any("app-message-type", am.GetType()))
		mpk = ""
	}

	h.logger.Debug("received app message", zap.String("type", amt.String()), zap.Int("numMedias", len(am.GetMedias())))

	i := messengertypes.Interaction{
		CID:                   cid.String(),
		Type:                  amt,
		Payload:               am.GetPayload(),
		IsMine:                isMe,
		ConversationPublicKey: gpk,
		SentDate:              am.GetSentDate(),
		DevicePublicKey:       dpk,
		Medias:                am.GetMedias(),
		MemberPublicKey:       mpk,
	}

	for _, media := range i.Medias {
		media.InteractionCID = i.CID
		media.State = messengertypes.Media_StateNeverDownloaded
	}

	return &i, nil
}

func (h *eventHandler) interactionFetchRelations(tx *dbWrapper, i *messengertypes.Interaction) error {
	// fetch conv from db
	if conversation, err := tx.getConversationByPK(i.ConversationPublicKey); err != nil {
		h.logger.Warn("conversation related to interaction not found")
	} else {
		i.Conversation = conversation
	}

	// build device
	switch {
	case i.IsMine: // myself
		i.MemberPublicKey = ""

	case i.Conversation != nil && i.Conversation.GetType() == messengertypes.Conversation_ContactType: // 1-1 conversation
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

	if i.Conversation != nil && i.Conversation.Type == messengertypes.Conversation_MultiMemberType && i.MemberPublicKey != "" {
		// fetch member from db
		member, err := tx.getMemberByPK(i.MemberPublicKey, i.ConversationPublicKey)
		if err != nil {
			h.logger.Warn("multimember message member not found", zap.String("public-key", i.MemberPublicKey), zap.Error(err))
		}

		i.Member = member
	}

	return nil
}

func (h *eventHandler) dispatchVisibleInteraction(i *messengertypes.Interaction) error {
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

		newUnread := !h.replay && !i.IsMine && !opened

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
		if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
			return err
		}

		return nil
	})
}

func (h *eventHandler) sendAck(cid, conversationPK string) error {
	h.logger.Debug("sending ack", zap.String("target", cid))

	// Don't send ack if message is already acked to prevent spam in multimember groups
	// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
	amp, err := messengertypes.AppMessage_TypeAcknowledge.MarshalPayload(0, nil, &messengertypes.AppMessage_Acknowledge{Target: cid})
	if err != nil {
		return err
	}

	cpk, err := b64DecodeBytes(conversationPK)
	if err != nil {
		return err
	}

	if _, err = h.protocolClient.AppMessageSend(h.ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: cpk,
		Payload: amp,
	}); err != nil {
		return err
	}

	return nil
}

func (h *eventHandler) interactionConsumeAck(tx *dbWrapper, i *messengertypes.Interaction) error {
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
			if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionDeleted, &messengertypes.StreamEvent_InteractionDeleted{CID: c}, false); err != nil {
				return err
			}
		}
	}

	return nil
}

func (h *eventHandler) handleAppMessageReplyOptions(tx *dbWrapper, i *messengertypes.Interaction, _ proto.Message) (*messengertypes.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc == nil {
		return i, isNew, nil
	}

	if err := h.svc.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeInteractionUpdated, &messengertypes.StreamEvent_InteractionUpdated{Interaction: i}, isNew); err != nil {
		return nil, isNew, err
	}

	return i, isNew, nil
}
