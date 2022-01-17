package messengerpayloads

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/gogo/protobuf/proto"
	ipfscid "github.com/ipfs/go-cid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

var ErrNilPayload = errcode.ErrInvalidInput.Wrap(errors.New("nil payload"))

type MetaFetcher interface {
	GroupPKForContact(ctx context.Context, pk []byte) ([]byte, error)
	OwnMemberAndDevicePKForConversation(ctx context.Context, pk []byte) (member []byte, device []byte, err error)
}

type EventHandler struct {
	ctx                context.Context
	db                 *messengerdb.DBWrapper
	logger             *zap.Logger
	dispatcher         messengerutil.Dispatcher
	metaFetcher        MetaFetcher
	postHandlerActions mt.EventHandlerPostActions
	metadataHandlers   map[protocoltypes.EventType]func(gme *protocoltypes.GroupMetadataEvent) error
	replay             bool
	appMessageHandlers map[mt.AppMessage_Type]struct {
		handler        func(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error)
		isVisibleEvent bool
	}
}

func (h *EventHandler) Ctx() context.Context {
	return h.ctx
}

func (h *EventHandler) Logger() *zap.Logger {
	return h.logger
}

func NewEventHandler(ctx context.Context, db *messengerdb.DBWrapper, metaFetcher MetaFetcher, postHandlerActions mt.EventHandlerPostActions, logger *zap.Logger, dispatcher messengerutil.Dispatcher, replay bool) *EventHandler {
	if logger == nil {
		logger = zap.NewNop()
	}
	logger = logger.Named("hdl")

	if dispatcher == nil {
		dispatcher = &messengerutil.NoopDispatcher{}
	}

	h := &EventHandler{
		ctx:                ctx,
		db:                 db,
		metaFetcher:        metaFetcher,
		postHandlerActions: postHandlerActions,
		dispatcher:         dispatcher,
		logger:             logger,
		replay:             replay,
	}

	h.bindHandlers()

	return h
}

func (h *EventHandler) bindHandlers() {
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
		protocoltypes.EventTypePushDeviceTokenRegistered:              h.pushDeviceTokenRegistered,
		protocoltypes.EventTypePushDeviceServerRegistered:             h.pushDeviceServerRegistered,
		protocoltypes.EventTypePushMemberTokenUpdate:                  h.pushMemberTokenUpdate,
	}
	h.appMessageHandlers = map[mt.AppMessage_Type]struct {
		handler        func(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error)
		isVisibleEvent bool
	}{
		mt.AppMessage_TypeAcknowledge:     {h.handleAppMessageAcknowledge, false},
		mt.AppMessage_TypeGroupInvitation: {h.handleAppMessageGroupInvitation, true},
		mt.AppMessage_TypeUserMessage:     {h.handleAppMessageUserMessage, true},
		mt.AppMessage_TypeSetUserInfo:     {h.handleAppMessageSetUserInfo, false},
		mt.AppMessage_TypeReplyOptions:    {h.handleAppMessageReplyOptions, false},
		mt.AppMessage_TypeUserReaction:    {h.handleAppMessageUserReaction, false},
		mt.AppMessage_TypeSetGroupInfo:    {h.handleAppMessageSetGroupInfo, false},
	}
}

func (h *EventHandler) WithContext(ctx context.Context) *EventHandler {
	nh := EventHandler{
		ctx:                ctx,
		db:                 h.db,
		metaFetcher:        h.metaFetcher,
		logger:             h.logger,
		dispatcher:         h.dispatcher,
		replay:             h.replay,
		postHandlerActions: h.postHandlerActions,
	}
	nh.bindHandlers()
	return &nh
}

func (h *EventHandler) HandleMetadataEvent(gme *protocoltypes.GroupMetadataEvent) error {
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

func (h *EventHandler) HandleAppMessage(gpk string, gme *protocoltypes.GroupMessageEvent, am *mt.AppMessage) (err error) {
	// TODO: override logger with fields

	stepTitle := fmt.Sprintf("Received from group %s", gpk)
	h.logger.Debug(stepTitle, tyber.FormatStepLogFields(h.ctx, []tyber.Detail{}, tyber.ForceReopen, tyber.UpdateTraceName(stepTitle))...)

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
	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		if mediasAdded, err = tx.AddMedias(medias); err != nil {
			return logError("Failed to add medias", err)
		}

		interactionFetchRelations(tx, i, h.logger)

		h.logger.Debug("Will handle app message", zap.Any("interaction", i), zap.Any("payload", amPayload))

		i, isNew, err = handler.handler(tx, i, amPayload)
		if err != nil {
			return logError("Failed to handle AppMessage", err)
		}

		if err := interactionConsumeAck(tx, i, h.dispatcher, h.logger); err != nil {
			return logError("Failed to consume acknowledge", err)
		}

		if i == nil {
			h.logger.Debug("Handler returned no interaction", zap.Any("payload", amPayload))
			return nil
		}

		if err := indexMessage(tx, i.CID, am); err != nil {
			return logError("Failed to index AppMessage", err)
		}

		return nil
	}); err != nil {
		return err
	}

	if handler.isVisibleEvent && isNew {
		if err := h.dispatchVisibleInteraction(i); err != nil {
			h.logger.Error("Unable to dispatch notification for interaction", tyber.FormatStepLogFields(h.ctx, tyber.ZapFieldsToDetails(logutil.PrivateString("cid", i.CID), zap.Error(err)))...)
		}
	}

	for i, media := range medias {
		if mediasAdded[i] {
			if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeMediaUpdated, &mt.StreamEvent_MediaUpdated{Media: media}, true); err != nil {
				h.logger.Error("Unable to dispatch notification for media", tyber.FormatStepLogFields(h.ctx, tyber.ZapFieldsToDetails(logutil.PrivateString("cid", media.CID), zap.Error(err)))...)
			}
		}
	}

	return nil
}

func (h *EventHandler) accountServiceTokenAdded(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountServiceTokenAdded
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if err := h.db.AddServiceToken(ev.ServiceToken); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	// dispatch event
	acc, err := h.db.GetAccount()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeAccountUpdated, &mt.StreamEvent_AccountUpdated{Account: acc}, false); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}

func (h *EventHandler) groupReplicating(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.GroupReplicating
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	cid, err := ipfscid.Cast(gme.GetEventContext().GetID())
	if err != nil {
		return err
	}

	convPK := messengerutil.B64EncodeBytes(gme.EventContext.GroupPK)

	if err := h.db.SaveConversationReplicationInfo(mt.ConversationReplicationInfo{
		CID:                   cid.String(),
		ConversationPublicKey: convPK,
		MemberPublicKey:       "", // TODO
		AuthenticationURL:     ev.AuthenticationURL,
		ReplicationServer:     ev.ReplicationServer,
	}); err != nil {
		return err
	}

	if conv, err := h.db.GetConversationByPK(convPK); err != nil {
		h.logger.Warn("unknown conversation", logutil.PrivateString("conversation-pk", convPK))
	} else if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) groupMetadataPayloadSent(gme *protocoltypes.GroupMetadataEvent) error {
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

	groupPK := messengerutil.B64EncodeBytes(gme.GetEventContext().GetGroupPK())

	return h.HandleAppMessage(groupPK, &groupMessageEvent, &appMessage)
}

func (h *EventHandler) accountGroupJoined(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	gpkb := ev.GetGroup().GetPublicKey()
	groupPK := messengerutil.B64EncodeBytes(gpkb)

	memPK, devPK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gpkb)
	if err != nil {
		return err
	}

	conversation, err := h.db.AddConversation(groupPK, messengerutil.B64EncodeBytes(memPK), messengerutil.B64EncodeBytes(devPK))
	switch {
	case errcode.Is(err, errcode.ErrDBEntryAlreadyExists):
		h.logger.Info("conversation already in db")
	case err != nil:
		return errcode.ErrDBAddConversation.Wrap(err)
	default:
		h.logger.Info("saved conversation in db")

		if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
			return err
		}
	}

	conversation, err = h.db.GetConversationByPK(groupPK)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err := h.postHandlerActions.ConversationJoined(conversation); err != nil {
		return err
	}

	h.logger.Info("AccountGroupJoined", logutil.PrivateString("pk", groupPK), logutil.PrivateString("known-as", conversation.GetDisplayName()))

	return nil
}

func (h *EventHandler) accountContactRequestOutgoingEnqueued(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return errcode.ErrProtocolEventUnmarshal.Wrap(err)
	}

	contactPKBytes := ev.GetContact().GetPK()
	contactPK := messengerutil.B64EncodeBytes(contactPKBytes)

	var cm mt.ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		h.logger.Error("Failed to unmarshal ContactMetadata", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "Payload", Description: string(ev.GetContact().GetMetadata())},
			{Name: "Error", Description: err.Error()},
		}, tyber.Status(tyber.Failed))...)
	}

	gpkB, err := h.metaFetcher.GroupPKForContact(h.ctx, contactPKBytes)
	if err != nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("unable to get group pk for contact: %w", err))
	}

	gpk := messengerutil.B64EncodeBytes(gpkB)

	memPK, devPK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gpkB)
	if err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// create new contact conversation
	var (
		contact      *mt.Contact
		conversation *mt.Conversation
	)

	// update db
	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		var err error

		contact, err = tx.AddContactRequestOutgoingEnqueued(contactPK, cm.DisplayName, gpk)
		if errors.Is(err, errcode.ErrDBEntryAlreadyExists) {
			return nil
		} else if err != nil {
			return errcode.ErrDBAddContactRequestOutgoingEnqueud.Wrap(err)
		}

		// create new conversation
		if conversation, err = tx.AddConversationForContact(gpk, messengerutil.B64EncodeBytes(memPK), messengerutil.B64EncodeBytes(devPK), contact.PublicKey); err != nil {
			return errcode.ErrDBAddConversation.Wrap(err)
		}

		contact.Conversation = conversation
		contact.ConversationPublicKey = gpk

		return nil
	}); err != nil {
		return err
	}

	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
		return errcode.ErrMessengerStreamEvent.Wrap(err)
	}

	if err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
		return errcode.ErrMessengerStreamEvent.Wrap(err)
	}

	return nil
}

func (h *EventHandler) accountContactRequestOutgoingSent(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	h.logger.Debug("Unmarshaled AccountContactRequestSent", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
		{Name: "Value", Description: fmt.Sprint(ev)},
	})...)

	contactPK := messengerutil.B64EncodeBytes(ev.GetContactPK())

	// Check if the event is emitted by the current user
	ownMemberPK, ownDevicePK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gme.EventContext.GroupPK)
	if err != nil {
		return errcode.ErrGroupInfo.Wrap(err)
	}

	var contact *mt.Contact
	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		var err error

		if _, err = tx.AddDevice(messengerutil.B64EncodeBytes(ownDevicePK), messengerutil.B64EncodeBytes(ownMemberPK)); err != nil {
			return errcode.ErrDBWrite.Wrap(fmt.Errorf("unable to add device to db: %w", err))
		}

		contact, err = tx.AddContactRequestOutgoingSent(contactPK)
		if err != nil {
			return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
		}

		return nil
	}); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	h.logger.Debug("Got contact from db", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
		{Name: "Contact", Description: fmt.Sprint(contact)},
	})...)

	// dispatch event and subscribe to group metadata
	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
		return err
	}

	err = h.dispatcher.Notify(
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

	if err := h.postHandlerActions.ContactConversationJoined(contact); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) accountContactRequestIncomingReceived(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	contactPK := messengerutil.B64EncodeBytes(ev.GetContactPK())

	var m mt.ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		h.logger.Error("Failed to unmarshal ContactMetadata", tyber.FormatStepLogFields(h.ctx, []tyber.Detail{
			{Name: "Payload", Description: string(ev.GetContactMetadata())},
			{Name: "Error", Description: err.Error()},
		}, tyber.Status(tyber.Failed))...)
	}

	groupPK, err := h.metaFetcher.GroupPKForContact(h.ctx, ev.GetContactPK())
	if err != nil {
		return err
	}
	groupPKBytes := messengerutil.B64EncodeBytes(groupPK)

	// Check if the event is emitted by the current user
	ownMemberPK, ownDevicePK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gme.EventContext.GroupPK)
	if err != nil {
		return errcode.ErrGroupInfo.Wrap(err)
	}

	// create new contact conversation
	var (
		conversation *mt.Conversation
		contact      *mt.Contact
	)

	// update db
	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		var err error

		contact, err = tx.AddContactRequestIncomingReceived(contactPK, m.GetDisplayName(), groupPKBytes)
		if errors.Is(err, errcode.ErrDBEntryAlreadyExists) {
			return nil
		} else if err != nil {
			return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
		}

		// create new conversation
		if conversation, err = tx.AddConversationForContact(groupPKBytes, messengerutil.B64EncodeBytes(ownMemberPK), messengerutil.B64EncodeBytes(ownDevicePK), contactPK); err != nil {
			return err
		}

		if _, err := tx.AddDevice(messengerutil.B64EncodeBytes(ownDevicePK), messengerutil.B64EncodeBytes(ownMemberPK)); err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		return nil
	}); err != nil {
		return err
	}

	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, true); err != nil {
		return err
	}

	if err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conversation}, true); err != nil {
		return err
	}

	err = h.dispatcher.Notify(
		mt.StreamEvent_Notified_TypeContactRequestReceived,
		"Contact request received",
		"From: "+contact.GetDisplayName(),
		&mt.StreamEvent_Notified_ContactRequestReceived{Contact: contact},
	)
	if err != nil {
		h.logger.Warn("failed to notify", zap.Error(err))
	}

	return nil
}

func (h *EventHandler) accountContactRequestIncomingAccepted(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.AccountContactRequestAccepted
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	if len(ev.GetContactPK()) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("contact pk is empty"))
	}
	contactPK := messengerutil.B64EncodeBytes(ev.GetContactPK())

	groupPK, err := h.metaFetcher.GroupPKForContact(h.ctx, ev.GetContactPK())
	if err != nil {
		return err
	}

	contact, err := h.db.AddContactRequestIncomingAccepted(contactPK, messengerutil.B64EncodeBytes(groupPK))
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
	}

	// dispatch event to subscribers
	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
		return err
	}

	if err := h.postHandlerActions.ContactConversationJoined(contact); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) contactRequestAccepted(contact *mt.Contact, memberPK []byte) error {
	// someone you invited just accepted the invitation
	// update contact

	{
		groupPK, err := h.metaFetcher.GroupPKForContact(h.ctx, memberPK)
		if err != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("can't get group public key for contact %w", err))
		}

		contact.State = mt.Contact_Accepted
		contact.ConversationPublicKey = messengerutil.B64EncodeBytes(groupPK)
	}

	// update db
	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		var err error

		// update existing contact
		if err = tx.UpdateContact(contact.GetPublicKey(), *contact); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	// dispatch events
	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: contact}, false); err != nil {
		return err
	}

	if err := h.postHandlerActions.ContactConversationJoined(contact); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) multiMemberGroupInitialMemberAnnounced(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.MultiMemberInitialMember
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	mpkb := ev.GetMemberPK()
	mpk := messengerutil.B64EncodeBytes(mpkb)
	gpkb := gme.GetEventContext().GetGroupPK()
	gpk := messengerutil.B64EncodeBytes(gpkb)

	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		// create or update member

		member, err := tx.GetMemberByPK(mpk, gpk)
		if err != gorm.ErrRecordNotFound && err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if err == gorm.ErrRecordNotFound {
			ownMemberPK, _, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gpkb)
			if err != nil {
				return errcode.ErrGroupInfo.Wrap(err)
			}

			isMe := bytes.Equal(ownMemberPK, mpkb)

			if _, err := tx.AddMember(mpk, gpk, "", "", isMe, true); err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}
		} else if err := tx.MarkMemberAsConversationCreator(member.PublicKey, gpk); err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		return nil
	}); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	// dispatch update
	{
		member, err := h.db.GetMemberByPK(mpk, gpk)
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, true)
		if err != nil {
			return err
		}

		h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", true))
	}

	return nil
}

// groupMemberDeviceAdded is called at different moments
// * on AccountGroup when you add a new device to your group
// * on ContactGroup when you or your contact add a new device
// * on MultiMemberGroup when you or anyone in a multimember group adds a new device
func (h *EventHandler) groupMemberDeviceAdded(gme *protocoltypes.GroupMetadataEvent) error {
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

	mpk := messengerutil.B64EncodeBytes(mpkb)
	dpk := messengerutil.B64EncodeBytes(dpkb)
	gpk := messengerutil.B64EncodeBytes(gpkb)

	// Check if the event is emitted by the current user
	ownMemberPK, _, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gme.EventContext.GroupPK)
	if err != nil {
		return errcode.ErrGroupInfo.Wrap(err)
	}

	isMe := bytes.Equal(ownMemberPK, mpkb)

	// Register device if not already known
	if _, err := h.db.GetDeviceByPK(dpk); errors.Is(err, errcode.ErrNotFound) || errors.Is(err, gorm.ErrRecordNotFound) {
		device, err := h.db.AddDevice(dpk, mpk)
		if err != nil {
			return err
		}

		err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeDeviceUpdated, &mt.StreamEvent_DeviceUpdated{Device: device}, true)
		if err != nil {
			h.logger.Error("error dispatching device updated", zap.Error(err))
		}
	}

	// Check whether a contact request has been accepted (a device from the contact has been added to the group)
	if contact, err := h.db.GetContactByPK(mpk); err == nil && contact.GetState() == mt.Contact_OutgoingRequestSent {
		if err := h.contactRequestAccepted(contact, mpkb); err != nil {
			return err
		}
	}

	// check backlogs
	userInfo := (*mt.AppMessage_SetUserInfo)(nil)
	{
		backlog, err := h.db.AttributeBacklogInteractions(dpk, gpk, mpk)
		if err != nil {
			return err
		}

		for _, elem := range backlog {
			h.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), logutil.PrivateString("device-pk", elem.GetDevicePublicKey()), logutil.PrivateString("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case mt.AppMessage_TypeSetUserInfo:
				var payload mt.AppMessage_SetUserInfo

				if err := proto.Unmarshal(elem.GetPayload(), &payload); err != nil {
					return err
				}

				userInfo = &payload

				if err := h.db.DeleteInteractions([]string{elem.CID}); err != nil {
					return err
				}

				if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionDeleted, &mt.StreamEvent_InteractionDeleted{CID: elem.GetCID(), ConversationPublicKey: gpk}, false); err != nil {
					return err
				}

			default:
				if err := messengerutil.StreamInteraction(h.dispatcher, h.db, elem.CID, false); err != nil {
					return err
				}
			}
		}
	}

	member := &mt.Member{
		PublicKey:             mpk,
		ConversationPublicKey: gpk,
		IsMe:                  isMe,
	}
	if userInfo != nil {
		member.DisplayName = userInfo.GetDisplayName()
		member.AvatarCID = userInfo.GetAvatarCID()
	}

	member, isNew, err := h.db.UpsertMember(mpk, gpk, *member)
	if err != nil {
		return err
	}

	err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, isNew)
	if err != nil {
		return err
	}

	h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))

	return nil
}

func (h *EventHandler) handleAppMessageAcknowledge(tx *messengerdb.DBWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	target, err := tx.MarkInteractionAsAcknowledged(i.TargetCID)
	switch {
	case err == gorm.ErrRecordNotFound:
		h.logger.Debug("added ack in backlog", logutil.PrivateString("target", i.TargetCID), logutil.PrivateString("cid", i.GetCID()))
		i, _, err = tx.AddInteraction(*i)
		if err != nil {
			return nil, false, err
		}

		return i, false, nil

	case err != nil:
		return nil, false, err

	default:
		h.logger.Debug(messengerutil.TyberEventAcknowledgeReceived, tyber.FormatEventLogFields(h.ctx, []tyber.Detail{{Name: "TargetCID", Description: i.TargetCID}})...)

		if target != nil {
			if err := messengerutil.StreamInteraction(h.dispatcher, tx, target.CID, false); err != nil {
				h.logger.Error("error while sending stream event", logutil.PrivateString("public-key", i.ConversationPublicKey), logutil.PrivateString("cid", i.CID), zap.Error(err))
			}
		}

		return i, false, nil
	}
}

func (h *EventHandler) handleAppMessageGroupInvitation(tx *messengerdb.DBWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	if len(i.GetPayload()) == 0 {
		return nil, false, ErrNilPayload
	}

	i, isNew, err := tx.AddInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if err := messengerutil.StreamInteraction(h.dispatcher, tx, i.CID, isNew); err != nil {
		return nil, isNew, err
	}

	// fetch contact from db
	var contact *mt.Contact
	if i.Conversation.Type == mt.Conversation_ContactType {
		if contact, err = tx.GetContactByPK(i.Conversation.ContactPublicKey); err != nil {
			h.logger.Warn("1to1 message contact not found", logutil.PrivateString("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
		}
		if !i.IsMine && isNew {
			err = h.dispatcher.Notify(mt.StreamEvent_Notified_TypeGroupInvitation, "Group invitation", "From: "+contact.GetDisplayName(), &mt.StreamEvent_Notified_GroupInvitation{Contact: contact})
			if err != nil {
				h.logger.Error("failed to notify", zap.Error(err))
			}
		}
	}

	// TODO: Notify for multimember conversation when it will be possible in UI

	return i, isNew, err
}

func (h *EventHandler) handleAppMessageUserMessage(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	// NOTE: it's ok to have an empty payload here since a user message can be only medias

	i, isNew, err := tx.AddInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if err := messengerutil.StreamInteraction(h.dispatcher, tx, i.CID, isNew); err != nil {
		return nil, isNew, err
	}

	if i.IsMine || h.replay || !isNew {
		return i, isNew, nil
	}

	if err := h.postHandlerActions.InteractionReceived(i); err != nil {
		return nil, isNew, err
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
		if contact, err = tx.GetContactByPK(i.Conversation.ContactPublicKey); err != nil {
			h.logger.Warn("1to1 message contact not found", logutil.PrivateString("public-key", i.Conversation.ContactPublicKey), zap.Error(err))
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

	err = h.dispatcher.Notify(mt.StreamEvent_Notified_TypeMessageReceived, title, body, &msgRecvd)
	if err != nil {
		h.logger.Error("failed to notify", zap.Error(err))
	}

	return i, isNew, nil
}

func (h *EventHandler) handleAppMessageSetUserInfo(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	if len(i.GetPayload()) == 0 {
		return nil, false, ErrNilPayload
	}

	payload := amPayload.(*mt.AppMessage_SetUserInfo)

	if i.GetConversation().GetType() == mt.Conversation_ContactType {
		if i.GetIsMine() {
			return i, false, nil
		}

		cpk := i.GetConversation().GetContactPublicKey()
		c, err := tx.GetContactByPK(cpk)
		if err != nil {
			return nil, false, err
		}

		if c.GetInfoDate() > i.GetSentDate() {
			return i, false, nil
		}
		h.logger.Debug("interesting contact SetUserInfo")

		c.DisplayName = payload.GetDisplayName()
		c.AvatarCID = payload.GetAvatarCID()
		err = tx.UpdateContact(cpk, mt.Contact{DisplayName: c.GetDisplayName(), AvatarCID: c.GetAvatarCID(), InfoDate: i.GetSentDate()})
		if err != nil {
			return nil, false, err
		}

		c, err = tx.GetContactByPK(i.GetConversation().GetContactPublicKey())
		if err != nil {
			return nil, false, err
		}

		if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeContactUpdated, &mt.StreamEvent_ContactUpdated{Contact: c}, false); err != nil {
			return nil, false, err
		}
		h.logger.Debug("dispatched contact update", logutil.PrivateString("name", c.GetDisplayName()), logutil.PrivateString("device-pk", i.GetDevicePublicKey()), logutil.PrivateString("conv", i.ConversationPublicKey))

		return i, false, nil
	}

	if i.MemberPublicKey == "" {
		// store in backlog
		h.logger.Info("storing SetUserInfo in backlog", logutil.PrivateString("name", payload.GetDisplayName()), logutil.PrivateString("device-pk", i.GetDevicePublicKey()), logutil.PrivateString("conv", i.ConversationPublicKey))
		ni, isNew, err := tx.AddInteraction(*i)
		if err != nil {
			return nil, false, err
		}
		return ni, isNew, nil
	}

	isNew := false
	existingMember, err := tx.GetMemberByPK(i.MemberPublicKey, i.ConversationPublicKey)
	if err == gorm.ErrRecordNotFound {
		isNew = true
	} else if err != nil {
		return nil, false, err
	}

	if !isNew && existingMember.GetInfoDate() > i.GetSentDate() {
		return i, false, nil
	}
	h.logger.Debug("interesting member SetUserInfo")

	member, isNew, err := tx.UpsertMember(
		i.MemberPublicKey,
		i.ConversationPublicKey,
		mt.Member{DisplayName: payload.GetDisplayName(), AvatarCID: payload.GetAvatarCID(), InfoDate: i.GetSentDate()},
	)
	if err != nil {
		return nil, false, err
	}

	err = h.dispatcher.StreamEvent(mt.StreamEvent_TypeMemberUpdated, &mt.StreamEvent_MemberUpdated{Member: member}, isNew)
	if err != nil {
		return nil, false, err
	}

	h.logger.Info("dispatched member update", zap.Any("member", member), zap.Bool("isNew", isNew))

	return i, false, nil
}

func (h *EventHandler) handleAppMessageUserReaction(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	if len(i.GetPayload()) == 0 {
		return nil, false, ErrNilPayload
	}

	return i, false, h.handleReaction(tx, i, amPayload)
}

func (h *EventHandler) handleReaction(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) error {
	if len(i.MemberPublicKey) == 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("empty member public key"))
	}
	if len(i.TargetCID) == 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("empty target cid"))
	}

	updated, err := tx.CreateOrUpdateReaction(&mt.Reaction{
		TargetCID:       i.TargetCID,
		MemberPublicKey: i.MemberPublicKey,
		Emoji:           amPayload.(interface{ GetEmoji() string }).GetEmoji(),
		IsMine:          i.IsMine,
		State:           amPayload.(interface{ GetState() bool }).GetState(),
		StateDate:       i.GetSentDate(),
	})
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	if updated {
		if err := messengerutil.StreamInteraction(h.dispatcher, tx, i.TargetCID, false); err != nil {
			h.logger.Debug("failed to stream updated target interaction after AddReaction", zap.Error(err))
		}
	}

	return nil
}

func interactionFromAppMessage(h *EventHandler, gpk string, gme *protocoltypes.GroupMessageEvent, am *mt.AppMessage) (*mt.Interaction, error) {
	amt := am.GetType()
	cid, err := ipfscid.Cast(gme.GetEventContext().GetID())
	if err != nil {
		return nil, err
	}

	gpkB, err := messengerutil.B64DecodeBytes(gpk)
	if err != nil {
		return nil, err
	}

	memPK, devPK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gpkB)
	if err != nil {
		return nil, err
	}

	dpkb := gme.GetHeaders().GetDevicePK()
	dpk := messengerutil.B64EncodeBytes(dpkb)

	isMe := bytes.Equal(devPK, dpkb)

	mpk := ""
	dev, err := h.db.GetDeviceByPK(dpk)
	if err != nil {
		h.logger.Error("failed to get memberPK from devicePK", zap.Error(err), zap.Bool("is-me", isMe), logutil.PrivateString("device-pk", dpk), logutil.PrivateString("group", gpk), zap.Any("app-message-type", am.GetType()))
	} else {
		mpk = dev.MemberPublicKey
		isMe = messengerutil.B64EncodeBytes(memPK) == dev.MemberPublicKey
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

func interactionFetchRelations(tx *messengerdb.DBWrapper, i *mt.Interaction, logger *zap.Logger) {
	// fetch conv from db
	if conversation, err := tx.GetConversationByPK(i.ConversationPublicKey); err != nil {
		logger.Warn("conversation related to interaction not found")
	} else {
		i.Conversation = conversation
	}

	// build device
	existingDevice, err := tx.GetDeviceByPK(i.DevicePublicKey)
	if err == nil { // device already exists
		i.MemberPublicKey = existingDevice.GetMemberPublicKey()
	} else { // device not found
		i.MemberPublicKey = "" // backlog magic
	}

	if i.Conversation != nil && i.Conversation.Type == mt.Conversation_MultiMemberType && i.MemberPublicKey != "" {
		// fetch member from db
		member, err := tx.GetMemberByPK(i.MemberPublicKey, i.ConversationPublicKey)
		if err != nil {
			logger.Warn("multimember message member not found", logutil.PrivateString("public-key", i.MemberPublicKey), zap.Error(err))
		}

		i.Member = member
	}
}

func (h *EventHandler) dispatchVisibleInteraction(i *mt.Interaction) error {
	if !h.dispatcher.IsEnabled() {
		return nil
	}

	if err := h.db.TX(h.ctx, func(tx *messengerdb.DBWrapper) error {
		// FIXME: check if app is in foreground
		// if conv is not open, increment the unread_count
		opened, err := tx.IsConversationOpened(i.ConversationPublicKey)
		if err != nil {
			return err
		}

		newUnread := !h.replay && !i.IsMine && !opened

		// db update
		if err := tx.UpdateConversationReadState(i.ConversationPublicKey, newUnread, time.Now()); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}

	// expr-based (see above) gorm updates don't update the go object
	// next query could be easily replace by a simple increment, but this way we're 100% sure to be up-to-date
	conv, err := h.db.GetConversationByPK(i.GetConversationPublicKey())
	if err != nil {
		return err
	}

	// dispatch update event
	if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: conv}, false); err != nil {
		return err
	}

	return nil
}

func interactionConsumeAck(tx *messengerdb.DBWrapper, i *mt.Interaction, dispatcher messengerutil.Dispatcher, logger *zap.Logger) error {
	cids, err := tx.GetAcknowledgementsCIDsForInteraction(i.CID)
	if err != nil {
		return err
	}

	if len(cids) == 0 {
		return nil
	}

	i.Acknowledged = true

	if err := tx.DeleteInteractions(cids); err != nil {
		return err
	}

	for _, c := range cids {
		logger.Debug("found ack in backlog", logutil.PrivateString("target", c), logutil.PrivateString("cid", i.GetCID()))
		if err := dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionDeleted, &mt.StreamEvent_InteractionDeleted{CID: c, ConversationPublicKey: i.GetConversationPublicKey()}, false); err != nil {
			return err
		}
	}

	return nil
}

func (h *EventHandler) handleAppMessageReplyOptions(tx *messengerdb.DBWrapper, i *mt.Interaction, _ proto.Message) (*mt.Interaction, bool, error) {
	if len(i.GetPayload()) == 0 {
		return nil, false, ErrNilPayload
	}

	i, isNew, err := tx.AddInteraction(*i)
	if err != nil {
		return nil, isNew, err
	}

	if err := messengerutil.StreamInteraction(h.dispatcher, tx, i.CID, isNew); err != nil {
		return nil, isNew, err
	}

	return i, isNew, nil
}

func indexMessage(tx *messengerdb.DBWrapper, id string, am *mt.AppMessage) error {
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

	if err := tx.InteractionIndexText(id, amText); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	return nil
}

func (h *EventHandler) handleAppMessageSetGroupInfo(tx *messengerdb.DBWrapper, i *mt.Interaction, amPayload proto.Message) (*mt.Interaction, bool, error) {
	if len(i.GetPayload()) == 0 {
		return nil, false, ErrNilPayload
	}

	payload := amPayload.(*mt.AppMessage_SetGroupInfo)

	if i.GetConversation().GetType() == mt.Conversation_MultiMemberType {
		cpk := i.GetConversationPublicKey()
		c, err := tx.GetConversationByPK(cpk)
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

		_, err = tx.UpdateConversation(mt.Conversation{DisplayName: c.GetDisplayName(), AvatarCID: c.GetAvatarCID(), InfoDate: c.GetInfoDate(), PublicKey: c.GetPublicKey()})
		if err != nil {
			return nil, false, err
		}

		c, err = tx.GetConversationByPK(cpk)
		if err != nil {
			return nil, false, err
		}

		if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeConversationUpdated, &mt.StreamEvent_ConversationUpdated{Conversation: c}, false); err != nil {
			return nil, false, err
		}
		h.logger.Debug("dispatched conversation update", logutil.PrivateString("name", c.GetDisplayName()), logutil.PrivateString("conv", i.ConversationPublicKey))

		return i, false, nil
	}

	return nil, false, errcode.ErrInternal
}

func interactionFromOutOfStoreAppMessage(h *EventHandler, gPKBytes []byte, outOfStoreMessage *protocoltypes.OutOfStoreMessage, am *mt.AppMessage) (*mt.Interaction, error) {
	amt := am.GetType()
	_, c, err := ipfscid.CidFromBytes(outOfStoreMessage.CID)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	gPK := messengerutil.B64EncodeBytes(gPKBytes)

	isMe, err := h.db.IsFromSelf(messengerutil.B64EncodeBytes(gPKBytes), messengerutil.B64EncodeBytes(outOfStoreMessage.DevicePK))
	if err != nil {
		return nil, errcode.ErrDBRead.Wrap(err)
	}

	dpk := messengerutil.B64EncodeBytes(outOfStoreMessage.DevicePK)

	h.logger.Debug("received app message", logutil.PrivateString("type", amt.String()), zap.Int("numMedias", len(am.GetMedias())))

	mpk := ""
	dev, err := h.db.GetDeviceByPK(dpk)
	if err != nil {
		h.logger.Error("unable to retrieve member pk", zap.Error(err))
	} else {
		mpk = dev.MemberPublicKey
	}

	i := mt.Interaction{
		CID:                   c.String(),
		Type:                  amt,
		Payload:               am.GetPayload(),
		IsMine:                isMe,
		ConversationPublicKey: gPK,
		SentDate:              am.GetSentDate(),
		DevicePublicKey:       dpk,
		MemberPublicKey:       mpk,
		Medias:                am.GetMedias(),
		OutOfStoreMessage:     true,
	}

	for _, media := range i.Medias {
		media.InteractionCID = i.CID
		media.State = mt.Media_StateNeverDownloaded
	}

	return &i, nil
}

func (h *EventHandler) isEventFromCurrentDevice(conversationPK []byte, devicePK []byte) (bool, error) {
	// FIXME: this is currently only used on the account group, we might require it in other contexts
	_, ownDevPK, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, conversationPK)
	if err != nil {
		return false, errcode.ErrInternal.Wrap(err)
	}

	return bytes.Equal(devicePK, ownDevPK), nil
}

func (h *EventHandler) pushDeviceTokenRegistered(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.PushDeviceTokenRegistered
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	if ok, err := h.isEventFromCurrentDevice(gme.EventContext.GroupPK, ev.DevicePK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	} else if !ok {
		h.logger.Info("event is from another device, ignoring")
		return nil
	}

	if newlyHandled, err := h.db.MarkMetadataEventHandled(gme.EventContext); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	} else if !newlyHandled {
		h.logger.Info("event has already been handled, ignoring")
		return nil
	}

	account, err := h.db.UpdateDevicePushToken(ev.Token)
	if err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	if err := h.postHandlerActions.PushServerOrTokenRegistered(account); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) pushMemberTokenUpdate(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.PushMemberTokenUpdate
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	tokenHash := sha256.New()
	tokenHash.Write(ev.Token)
	tokenSum := tokenHash.Sum(nil)

	memberPKB, _, err := h.metaFetcher.OwnMemberAndDevicePKForConversation(h.ctx, gme.EventContext.GroupPK)
	if err != nil {
		return err
	}

	if err := h.db.UpdateDeviceSetPushToken(h.ctx, messengerutil.B64EncodeBytes(memberPKB), messengerutil.B64EncodeBytes(ev.DevicePK), messengerutil.B64EncodeBytes(gme.EventContext.GroupPK), hex.EncodeToString(tokenSum)); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) pushDeviceServerRegistered(gme *protocoltypes.GroupMetadataEvent) error {
	var ev protocoltypes.PushDeviceServerRegistered
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	if ok, err := h.isEventFromCurrentDevice(gme.EventContext.GroupPK, ev.DevicePK); err != nil {
		return errcode.ErrInternal.Wrap(err)
	} else if !ok {
		return nil
	}

	if newlyHandled, err := h.db.MarkMetadataEventHandled(gme.EventContext); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	} else if !newlyHandled {
		return nil
	}

	account, err := h.db.UpdateDevicePushServer(ev.Server)
	if err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	if err := h.postHandlerActions.PushServerOrTokenRegistered(account); err != nil {
		return err
	}

	return nil
}

func (h *EventHandler) GetAlreadyHandledMessage(cid ipfscid.Cid) (bool, *mt.Interaction, error) {
	i, err := h.db.GetInteractionByCID(cid.String())
	if err == gorm.ErrRecordNotFound {
		return false, nil, nil
	} else if err != nil {
		return false, nil, errcode.ErrInternal.Wrap(err)
	}

	return true, i, nil
}

func (h *EventHandler) HandleOutOfStoreAppMessage(groupPK []byte, message *protocoltypes.OutOfStoreMessage, payload []byte) (*mt.Interaction, bool, error) {
	if message == nil {
		return nil, false, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no message specified"))
	}

	_, c, err := ipfscid.CidFromBytes(message.CID)
	if err != nil {
		return nil, false, errcode.ErrInvalidInput.Wrap(err)
	}

	if i, err := h.db.GetInteractionByCID(c.String()); err != nil && err != gorm.ErrRecordNotFound {
		return nil, false, errcode.ErrDBRead.Wrap(err)
	} else if err == nil {
		h.logger.Info("push payload received but was previously handled")
		return i, false, nil
	}

	env := protocoltypes.EncryptedMessage{}
	if err := env.Unmarshal(payload); err != nil {
		return nil, false, errcode.ErrDeserialization.Wrap(err)
	}

	_, am, err := mt.UnmarshalAppMessage(env.Plaintext)
	if err != nil {
		return nil, false, errcode.ErrDeserialization.Wrap(err)
	}

	// build interaction
	i, err := interactionFromOutOfStoreAppMessage(h, groupPK, message, &am)
	if err != nil {
		return nil, false, err
	}

	i, isNew, err := h.db.AddInteraction(*i)
	if err != nil {
		return nil, false, errcode.ErrDBWrite.Wrap(err)
	}

	if isNew {
		if err := h.dispatcher.StreamEvent(mt.StreamEvent_TypeInteractionUpdated, &mt.StreamEvent_InteractionUpdated{Interaction: i}, true); err != nil {
			return nil, false, err
		}
	}

	return i, isNew, nil
}
