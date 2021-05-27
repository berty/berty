package bertymessenger

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type eventHandler struct {
	ctx                context.Context
	db                 *dbWrapper
	protocolClient     protocoltypes.ProtocolServiceClient // TODO: on usage ensure meaningful calls
	logger             *zap.Logger
	svc                *service // TODO: on usage ensure not nil
	metadataHandlers   map[protocoltypes.EventType]func(gme *protocoltypes.GroupMetadataEvent) error
	replay             bool
	appMessageHandlers map[mt.AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error)
		isVisibleEvent bool
	}
}

func newEventHandler(ctx context.Context, db *dbWrapper, protocolClient protocoltypes.ProtocolServiceClient, logger *zap.Logger, svc *service, replay bool) *eventHandler {
	if logger == nil {
		logger = zap.NewNop()
	}
	logger = logger.Named("hdl")

	h := &eventHandler{
		ctx:            ctx,
		db:             db,
		protocolClient: protocolClient,
		logger:         logger,
		svc:            svc,
		replay:         replay,
	}

	h.bindHandlers()

	return h
}

func (h *eventHandler) bindHandlers() {
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
	h.appMessageHandlers = map[mt.AppMessage_Type]struct {
		handler        func(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error)
		isVisibleEvent bool
	}{
		mt.AppMessage_TypeAcknowledge:     {h.handleAppMessageAcknowledge, false},
		mt.AppMessage_TypeGroupInvitation: {h.handleAppMessageGroupInvitation, false},
		mt.AppMessage_TypeUserMessage:     {h.handleAppMessageUserMessage, true},
		mt.AppMessage_TypeSetUserInfo:     {h.handleAppMessageSetUserInfo, false},
		mt.AppMessage_TypeReplyOptions:    {h.handleAppMessageReplyOptions, false},
		mt.AppMessage_TypeUserReaction:    {h.handleAppMessageUserReaction, false},
		mt.AppMessage_TypeSetGroupInfo:    {h.handleAppMessageSetGroupInfo, false},
	}
}

func (h *eventHandler) withContext(ctx context.Context) *eventHandler {
	nh := eventHandler{
		ctx:            ctx,
		db:             h.db,
		protocolClient: h.protocolClient,
		logger:         h.logger,
		svc:            h.svc,
		replay:         h.replay,
	}
	nh.bindHandlers()
	return &nh
}

func (h *eventHandler) handleMetadataEvent(gme *protocoltypes.GroupMetadataEvent) error {
	et := gme.GetMetadata().GetEventType()
	// FIXME(@n0izn0iz): tyber will crash on my machine if I remove the next line (blank screen in traces list in all sessions)
	h.logger.Info("Received protocol event in MessengerService", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{{Name: "Type", Description: et.String()}}, tyber.ForceReopen)...)

	handler, ok := h.metadataHandlers[et]
	if !ok {
		tyber.LogStep(h.ctx, h.logger, "Event ignored", tyber.WithDetail("Type", et.String()), tyber.ForceReopen)
		return nil
	}

	if err := handler(gme); err != nil {
		return err
	}

	return nil
}

func (h *eventHandler) handleAppMessage(gpk string, gme *protocoltypes.GroupMessageEvent, am *mt.AppMessage) (err error) {
	// TODO: override logger with fields

	{
		groupType := ""
		if reply, err := h.protocolClient.GroupInfo(h.ctx, &protocoltypes.GroupInfo_Request{GroupPK: gme.GetEventContext().GetGroupPK()}); err == nil {
			groupType = strings.TrimPrefix(reply.GetGroup().GetGroupType().String(), "GroupType")
		}
		stepTitle := fmt.Sprintf("Received %s from %s group %s", strings.TrimPrefix(am.GetType().String(), "Type"), groupType, gpk)
		h.logger.Debug(stepTitle, tyber.FormatStepLogFields(h.ctx, []tyber.Detail{}, tyber.ForceReopen, tyber.UpdateTraceName(stepTitle))...)
	}

	// get handler
	handler, ok := h.appMessageHandlers[am.Type]
	if !ok {
		h.logger.Warn("Unsupported AppMessage_Type in messenger", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{{Name: "Type", Description: am.GetType().String()}})...)
		return nil
	}

	logError := func(text string, err error, muts ...tyber.StepMutator) error {
		return tyber.LogError(h.ctx, h.logger, text, err, append(muts, tyber.ForceReopen)...)
	}

	// unmarshal payload
	muts := []tyber.StepMutator{
		tyber.WithDetail("Type", am.GetType().String()),
		tyber.WithCIDDetail("CID", gme.GetEventContext().GetID()),
		tyber.WithDetail("MediasCount", strconv.Itoa(len(am.GetMedias()))),
		tyber.WithDetail("TargetCID", am.GetTargetCID()),
	}
	amPayload, err := am.UnmarshalPayload()
	if err != nil {
		muts = append(muts, tyber.WithDetail("RawPayload", string(am.Payload)))
		return logError("Failed to unmarshal payload", err, muts...)
	}
	muts = append(muts, tyber.WithJSONDetail("Payload", amPayload))
	tyber.LogStep(h.ctx, h.logger, "Unmarshaled AppMessage payload", muts...)

	// build interaction
	i, err := interactionFromAppMessage(h, gpk, gme, am)
	if err != nil {
		return logError("Failed to generate interaction", err)
	}
	tyber.LogStep(h.ctx, h.logger, "Generated interaction", tyber.WithJSONDetail("Interaction", i))

	medias := i.GetMedias()
	var mediasAdded []bool

	// start a transaction
	var isNew bool
	if err := h.db.tx(h.ctx, func(tx *dbWrapper) error {
		if mediasAdded, err = tx.addMedias(medias); err != nil {
			return logError("Failed to add medias", err)
		}

		h.interactionFetchRelations(tx, i)

		if err := h.interactionConsumeAck(tx, i); err != nil {
			return logError("Failed to consume acknowledge", err)
		}

		h.logger.Debug("Will handle app message", zap.Any("interaction", i), zap.Any("payload", amPayload))

		i, isNew, err = handler.handler(tx, i, amPayload)
		if err != nil {
			return logError("Failed to handle AppMessage", err)
		}

		if i == nil {
			h.logger.Debug("Handler returned no interaction", zap.Any("payload", amPayload))
			return nil
		}

		if err := h.indexMessage(tx, i.CID, am); err != nil {
			return logError("Failed to index AppMessage", err)
		}

		return nil
	}); err != nil {
		return err
	}

	if handler.isVisibleEvent && isNew {
		if err := h.dispatchVisibleInteraction(i); err != nil {
			h.logger.Error("Unable to dispatch notification for interaction", tyber.FormatStepLogFields(h.ctx, tyber.ZapFieldsToDetails(zap.String("cid", i.CID), zap.Error(err)))...)
		}
	}

	for i, media := range medias {
		if mediasAdded[i] {
			if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeMediaUpdated, &mt.StreamEvent_MediaUpdated{Media: media}, true); err != nil {
				h.logger.Error("Unable to dispatch notification for media", tyber.FormatStepLogFields(h.ctx, tyber.ZapFieldsToDetails(zap.String("cid", media.CID), zap.Error(err)))...)
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

		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeAccountUpdated, &mt.StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
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

	if err := h.db.saveConversationReplicationInfo(mt.ConversationReplicationInfo{
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
	} else if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return err
	}

	return nil
}

func (h *eventHandler) groupMetadataPayloadSent(gme *protocoltypes.GroupMetadataEvent) error {
	var appMetadata protocoltypes.AppMetadata
	if err := proto.Unmarshal(gme.GetEvent(), &appMetadata); err != nil {
		return err
	}

	var appMessage mt.AppMessage
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
			if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
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
		if err := h.svc.subscribeToGroup(context.Background(), gpkb); err != nil {
			return err
		}

		h.logger.Debug("Subscribed to group", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "GroupPublicKey", Description: conversation.GetPublicKey()},
			{Name: "GroupType", Description: conversation.GetType().String()},
		})...)

		h.logger.Info("AccountGroupJoined", zap.String("pk", groupPK), zap.String("known-as", conversation.GetDisplayName()))
	}

	return nil
}

func (h *eventHandler) accountContactRequestOutgoingEnqueued(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrProtocolEventUnmarshal.Wrap(err)
	}

	contactPKBytes := ev.GetContact().GetPK()
	contactPK := b64EncodeBytes(contactPKBytes)

	var cm mt.ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		h.logger.Error("Failed to unmarshal ContactMetadata", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "Payload", Description: string(ev.GetContact().GetMetadata())},
			{Name: "Error", Description: err.Error()},
		}, tyber.Status(tyber.Failed))...)
	}

	gpk := b64EncodeBytes(ev.GetGroupPK())
	if gpk == "" {
		groupInfoReply, err := h.protocolClient.GroupInfo(h.ctx, &protocoltypes.GroupInfo_Request{ContactPK: contactPKBytes})
		if err != nil {
			return errcode.ErrProtocolGetGroupInfo.Wrap(err)
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
	var conversation *mt.Conversation

	// update db
	if err := h.db.tx(h.ctx, func(tx *dbWrapper) error {
		var err error

		// create new conversation
		if conversation, err = tx.addConversationForContact(contact.ConversationPublicKey, contact.PublicKey); err != nil {
			return errcode.ErrDBAddConversation.Wrap(err)
		}

		return nil
	}); err != nil {
		return err
	}

	if h.svc != nil {
		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
			return errcode.ErrMessengerStreamEvent.Wrap(err)
		}

		if err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
			return errcode.ErrMessengerStreamEvent.Wrap(err)
		}
	}

	return nil
}

func (h *eventHandler) accountContactRequestOutgoingSent(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	h.logger.Debug("Unmarshaled AccountContactRequestSent", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
		{Name: "Value", Description: fmt.Sprint(ev)},
	})...)

	contactPK := b64EncodeBytes(ev.GetContactPK())

	contact, err := h.db.addContactRequestOutgoingSent(contactPK)
	if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
	}

	h.logger.Debug("Got contact from db", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
		{Name: "Contact", Description: fmt.Sprint(contact)},
	})...)

	// dispatch event and subscribe to group metadata
	if h.svc != nil {
		err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false)
		if err != nil {
			return err
		}

		err = h.svc.dispatcher.Notify(
			mt.StreamEvent_Notified_TypeContactRequestSent,
			"Contact request sent",
			"To: "+contact.GetDisplayName(),
			&mt.StreamEvent_Notified_ContactRequestSent{Contact: contact},
		)
		if err != nil {
			h.logger.Warn("Failed to notify", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
				{Name: "Error", Description: err.Error()},
			})...)
		}

		groupPK, err := groupPKFromContactPK(h.ctx, h.protocolClient, ev.GetContactPK())
		if err != nil {
			return err
		}

		if _, err = h.protocolClient.ActivateGroup(h.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.logger.Warn("Failed to activate group", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
				{Name: "Error", Description: err.Error()},
				{Name: "GroupPublicKey", Description: b64EncodeBytes(groupPK)},
			})...)
		}

		// FIXME: if multiple devices, will be sent multiple times
		if err := h.svc.sendAccountUserInfo(h.ctx, b64EncodeBytes(groupPK)); err != nil {
			h.logger.Error("Failed to set user info after outgoing request sent", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
				{Name: "Error", Description: err.Error()},
				{Name: "GroupPublicKey", Description: b64EncodeBytes(groupPK)},
			})...)
		}

		if err := h.svc.subscribeToMetadata(context.Background(), groupPK); err != nil {
			return err
		}

		h.logger.Debug("Subscribed to contact metadata", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "GroupPublicKey", Description: b64EncodeBytes(groupPK)},
			{Name: "ContactPublicKey", Description: contactPK},
		})...)

		return nil
	}

	return nil
}

func (h *eventHandler) accountContactRequestIncomingReceived(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	contactPK := b64EncodeBytes(ev.GetContactPK())

	var m mt.ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		h.logger.Error("Failed to unmarshal ContactMetadata", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "Payload", Description: string(ev.GetContactMetadata())},
			{Name: "Error", Description: err.Error()},
		}, tyber.Status(tyber.Failed))...)
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
	var conversation *mt.Conversation

	// update db
	if err := h.db.tx(h.ctx, func(tx *dbWrapper) error {
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
		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
			return err
		}

		if err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
			return err
		}

		err = h.svc.dispatcher.Notify(
			mt.StreamEvent_Notified_TypeContactRequestReceived,
			"Contact request received",
			"From: "+contact.GetDisplayName(),
			&mt.StreamEvent_Notified_ContactRequestReceived{Contact: contact},
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
		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
			return err
		}

		// activate group
		if _, err := h.protocolClient.ActivateGroup(h.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		if err := h.svc.sendAccountUserInfo(h.ctx, b64EncodeBytes(groupPK)); err != nil {
			h.svc.logger.Error("failed to set user info after incoming request accepted", zap.Error(err))
		}

		// subscribe to group messages and metadata
		if err := h.svc.subscribeToGroup(context.Background(), groupPK); err != nil {
			return err
		}

		h.logger.Debug("Subscribed to contact group", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "GroupPublicKey", Description: b64EncodeBytes(groupPK)},
			{Name: "ContactPublicKey", Description: contactPK},
		})...)

		return nil
	}

	return nil
}

func (h *eventHandler) contactRequestAccepted(contact *mt.Contact, memberPK []byte) error {
	// someone you invited just accepted the invitation
	// update contact
	var groupPK []byte
	{
		var err error
		if groupPK, err = groupPKFromContactPK(h.ctx, h.protocolClient, memberPK); err != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("can't get group public key for contact %w", err))
		}

		contact.State = mt.Contact_Accepted
		contact.ConversationPublicKey = b64EncodeBytes(groupPK)
	}

	// update db
	if err := h.db.tx(h.ctx, func(tx *dbWrapper) error {
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
		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
			return err
		}

		// activate group and subscribe to message events
		if _, err := h.protocolClient.ActivateGroup(h.ctx, &protocoltypes.ActivateGroup_Request{GroupPK: groupPK}); err != nil {
			h.svc.logger.Warn("failed to activate group", zap.String("pk", b64EncodeBytes(groupPK)))
		}

		if err := h.svc.subscribeToMessages(context.Background(), groupPK); err != nil {
			return err
		}

		h.logger.Debug("Subscribed to contact messages", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "GroupPublicKey", Description: contact.ConversationPublicKey},
			{Name: "ContactPublicKey", Description: contact.PublicKey},
		})...)

		return nil
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

	if err := h.db.tx(h.ctx, func(tx *dbWrapper) error {
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
			err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, true)
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
			err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeDeviceUpdated, &mt.StreamEvent_DeviceUpdated{Device: device}, true)
			if err != nil {
				h.logger.Error("error dispatching device updated", zap.Error(err))
			}
		}
	}

	// Check whether a contact request has been accepted (a device from the contact has been added to the group)
	if contact, err := h.db.getContactByPK(mpk); err == nil && contact.GetState() == mt.Contact_OutgoingRequestSent {
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

		userInfo := (*mt.AppMessage_SetUserInfo)(nil)

		for _, elem := range backlog {
			h.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), zap.String("device-pk", elem.GetDevicePublicKey()), zap.String("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case mt.AppMessage_TypeSetUserInfo:
				var payload mt.AppMessage_SetUserInfo

				if err := proto.Unmarshal(elem.GetPayload(), &payload); err != nil {
					return err
				}

				userInfo = &payload

				if err := h.db.deleteInteractions([]string{elem.CID}); err != nil {
					return err
				}

				if h.svc != nil {
					if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionDeleted, &mt.StreamEvent_InteractionDeleted{CID: elem.GetCID()}, false); err != nil {
						return err
					}
				}

			default:
				if err := h.svc.streamInteraction(h.db, elem.CID, false); err != nil {
					return err
				}
			}
		}

		member, isNew, err := h.db.upsertMember(mpk, gpk, mt.Member{
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
			err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, isNew)
			if err != nil {
				return err
			}

			h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))
		}
	}

	return nil
}

func (h *eventHandler) handleAppMessageAcknowledge(tx *dbWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	target, err := tx.markInteractionAsAcknowledged(i.TargetCID)
	switch {
	case err == gorm.ErrRecordNotFound:
		h.logger.Debug("added ack in backlog", zap.String("target", i.TargetCID), zap.String("cid", i.GetCID()))
		i, _, err = tx.addInteraction(*i)
		if err != nil {
			return nil, false, err
		}

		return i, false, nil

	case err != nil:
		return nil, false, err

	default:
		h.logger.Debug(TyberEventAcknowledgeReceived, tyber.FormatEventLogFields(h.ctx, []tyber.Detail{{Name: "TargetCID", Description: i.TargetCID}})...)

		if target != nil {
			if err := h.svc.streamInteraction(tx, target.CID, false); err != nil {
				h.logger.Error("error while sending stream event", zap.String("public-key", i.ConversationPublicKey), zap.String("cid", i.CID), zap.Error(err))
			}
		}

		return i, false, nil
	}
}

func (h *eventHandler) handleAppMessageGroupInvitation(tx *dbWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc != nil {
		if err := h.svc.streamInteraction(tx, i.CID, isNew); err != nil {
			return nil, isNew, err
		}
	}

	return i, isNew, err
}

func (h *eventHandler) handleAppMessageUserMessage(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc == nil {
		return i, isNew, nil
	}

	if err := h.svc.streamInteraction(tx, i.CID, isNew); err != nil {
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
	var contact *mt.Contact
	if i.Conversation.Type == mt.Conversation_ContactType {
		if contact, err = tx.getContactByPK(i.Conversation.ContactPublicKey); err != nil {
			h.logger.Warn("1to1 message contact not found", zap.String("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
		}
	}

	payload := amPayload.(*mt.AppMessage_UserMessage)
	var title string
	body := payload.GetBody()
	if contact != nil && i.Conversation.Type == mt.Conversation_ContactType {
		title = contact.GetDisplayName()
	} else {
		title = i.Conversation.GetDisplayName()
		memberName := i.Member.GetDisplayName()
		if memberName != "" {
			body = memberName + ": " + payload.GetBody()
		}
	}

	msgRecvd := mt.StreamEvent_Notified_MessageReceived{
		Interaction:  i,
		Conversation: i.Conversation,
		Contact:      contact,
	}
	err = h.svc.dispatcher.Notify(mt.StreamEvent_Notified_TypeMessageReceived, title, body, &msgRecvd)

	if err != nil {
		h.logger.Error("failed to notify", zap.Error(err))
	}

	return i, isNew, nil
}

func (h *eventHandler) handleAppMessageSetUserInfo(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	payload := amPayload.(*mt.AppMessage_SetUserInfo)

	if i.GetConversation().GetType() == mt.Conversation_ContactType {
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
		err = tx.updateContact(cpk, mt.Contact{DisplayName: c.GetDisplayName(), AvatarCID: c.GetAvatarCID(), InfoDate: i.GetSentDate()})
		if err != nil {
			return nil, false, err
		}

		c, err = tx.getContactByPK(i.GetConversation().GetContactPublicKey())
		if err != nil {
			return nil, false, err
		}

		if h.svc != nil {
			err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: c}, false)
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
		mt.Member{DisplayName: payload.GetDisplayName(), AvatarCID: payload.GetAvatarCID(), InfoDate: i.GetSentDate()},
	)
	if err != nil {
		return nil, false, err
	}

	if h.svc != nil {
		err = h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, isNew)
		if err != nil {
			return nil, false, err
		}

		h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))
	}

	return i, false, nil
}

func (h *eventHandler) handleAppMessageUserReaction(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	return i, false, h.handleReaction(tx, i, amPayload)
}

func (h *eventHandler) handleReaction(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) error {
	if len(i.MemberPublicKey) == 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("empty member public key"))
	}
	if len(i.TargetCID) == 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("empty target cid"))
	}

	reaction := mt.Reaction{
		TargetCID:       i.TargetCID,
		MemberPublicKey: i.MemberPublicKey,
		Emoji:           amPayload.(interface{ GetEmoji() string }).GetEmoji(),
		IsMine:          i.IsMine,
		State:           amPayload.(interface{ GetState() bool }).GetState(),
		StateDate:       i.GetSentDate(),
	}

	existingReactions := ([]*mt.Reaction)(nil)
	if err := tx.db.Where(&mt.Reaction{
		MemberPublicKey: reaction.MemberPublicKey,
		TargetCID:       reaction.TargetCID,
		Emoji:           reaction.Emoji,
	}).Find(&existingReactions).Error; err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	if len(existingReactions) > 1 {
		return errcode.ErrInternal.Wrap(fmt.Errorf("expected max 1 reaction, got %d", len(existingReactions)))
	}

	updated := false
	if len(existingReactions) != 0 {
		for _, r := range existingReactions {
			if reaction.StateDate > r.StateDate {
				if err := tx.db.Select("state", "state_date").Updates(&reaction).Error; err != nil {
					return errcode.ErrDBWrite.Wrap(err)
				}
				updated = true
			}
		}
	} else {
		if err := tx.db.Create(&reaction).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		updated = true
	}

	if updated {
		if err := h.svc.streamInteraction(tx, i.TargetCID, false); err != nil {
			h.logger.Debug("failed to stream updated target interaction after AddReaction", zap.Error(err))
		}
	}

	return nil
}

func interactionFromAppMessage(h *eventHandler, gpk string, gme *protocoltypes.GroupMessageEvent, am *mt.AppMessage) (*mt.Interaction, error) {
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
	if err != nil || len(mpk) == 0 {
		h.logger.Error("failed to get memberPK from devicePK", zap.Error(err), zap.Bool("is-me", isMe), zap.String("device-pk", dpk), zap.String("group", gpk), zap.Any("app-message-type", am.GetType()))
		mpk = ""
	}

	i := mt.Interaction{
		CID:                   cid.String(),
		Type:                  amt,
		Payload:               am.Payload,
		IsMine:                isMe,
		ConversationPublicKey: gpk,
		SentDate:              am.GetSentDate(),
		DevicePublicKey:       dpk,
		Medias:                am.GetMedias(),
		MemberPublicKey:       mpk,
		TargetCID:             am.GetTargetCID(),
	}

	for _, media := range i.Medias {
		media.InteractionCID = i.CID
		media.State = mt.Media_StateNeverDownloaded
	}

	return &i, nil
}

func (h *eventHandler) interactionFetchRelations(tx *dbWrapper, i *mt.Interaction) {
	// fetch conv from db
	if conversation, err := tx.getConversationByPK(i.ConversationPublicKey); err != nil {
		h.logger.Warn("conversation related to interaction not found")
	} else {
		i.Conversation = conversation
	}

	// build device
	existingDevice, err := tx.getDeviceByPK(i.DevicePublicKey)
	if err == nil { // device already exists
		i.MemberPublicKey = existingDevice.GetMemberPublicKey()
	} else { // device not found
		i.MemberPublicKey = "" // backlog magic
	}

	if i.Conversation != nil && i.Conversation.Type == mt.Conversation_MultiMemberType && i.MemberPublicKey != "" {
		// fetch member from db
		member, err := tx.getMemberByPK(i.MemberPublicKey, i.ConversationPublicKey)
		if err != nil {
			h.logger.Warn("multimember message member not found", zap.String("public-key", i.MemberPublicKey), zap.Error(err))
		}

		i.Member = member
	}
}

func (h *eventHandler) dispatchVisibleInteraction(i *mt.Interaction) error {
	if h.svc == nil {
		return nil
	}

	return h.db.tx(h.ctx, func(tx *dbWrapper) error {
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
		if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
			return err
		}

		return nil
	})
}

func (h *eventHandler) sendAck(cid, conversationPK string) error {
	tyber.LogStep(h.ctx, h.logger, fmt.Sprintf("Sending acknowledge with target %s on group %s", cid, conversationPK))
	logError := func(text string, err error) error { return tyber.LogError(h.ctx, h.logger, text, err) }

	// TODO: Don't send ack if message is already acked to prevent spam in multimember groups
	// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
	amp, err := mt.AppMessage_TypeAcknowledge.MarshalPayload(0, cid, nil, &mt.AppMessage_Acknowledge{})
	if err != nil {
		return logError("Failed to marshal acknowledge", err)
	}

	cpk, err := b64DecodeBytes(conversationPK)
	if err != nil {
		return logError("Failed to decode conversation public key", err)
	}

	reply, err := h.protocolClient.AppMessageSend(h.ctx, &protocoltypes.AppMessageSend_Request{
		GroupPK: cpk,
		Payload: amp,
	})
	if err != nil {
		return logError("Protocol error", err)
	}
	tyber.LogStep(h.ctx, h.logger, "Acknowledge sent", tyber.WithCIDDetail("CID", reply.GetCID()))

	return nil
}

func (h *eventHandler) interactionConsumeAck(tx *dbWrapper, i *mt.Interaction) error {
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
			if err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionDeleted, &mt.StreamEvent_InteractionDeleted{CID: c}, false); err != nil {
				return err
			}
		}
	}

	return nil
}

func (h *eventHandler) handleAppMessageReplyOptions(tx *dbWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	i, isNew, err := tx.addInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if h.svc == nil {
		return i, isNew, nil
	}

	if err := h.svc.streamInteraction(tx, i.CID, isNew); err != nil {
		return nil, isNew, err
	}

	return i, isNew, nil
}

func (h *eventHandler) indexMessage(tx *dbWrapper, id string, am *mt.AppMessage) error {
	if len(id) == 0 {
		return nil
	}

	amText, err := am.TextRepresentation()
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if amText == "" {
		return nil
	}

	if err := tx.interactionIndexText(id, amText); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	return nil
}

func (h *eventHandler) handleAppMessageSetGroupInfo(tx *dbWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	payload := amPayload.(*mt.AppMessage_SetGroupInfo)

	if i.GetConversation().GetType() == mt.Conversation_MultiMemberType {
		cpk := i.GetConversationPublicKey()
		c, err := tx.getConversationByPK(cpk)
		if err != nil {
			return nil, false, err
		}

		if c.GetInfoDate() > i.GetSentDate() {
			return i, false, nil
		}
		h.logger.Debug("interesting conversation SetGroupInfo")

		if payload.GetDisplayName() != "" {
			c.DisplayName = payload.GetDisplayName()
		}
		if payload.GetAvatarCid() != "" {
			c.AvatarCID = payload.GetAvatarCid()
		}
		c.InfoDate = i.GetSentDate()

		_, err = tx.updateConversation(mt.Conversation{DisplayName: c.GetDisplayName(), AvatarCID: c.GetAvatarCID(), InfoDate: c.GetInfoDate(), PublicKey: c.GetPublicKey()})
		if err != nil {
			return nil, false, err
		}

		c, err = tx.getConversationByPK(cpk)
		if err != nil {
			return nil, false, err
		}

		if h.svc != nil {
			err := h.svc.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: c}, false)
			if err != nil {
				return nil, false, err
			}
			h.logger.Debug("dispatched conversation update", zap.String("name", c.GetDisplayName()), zap.String("conv", i.ConversationPublicKey))
		}

		return i, false, nil
	}

	return nil, false, errcode.ErrInternal
}
