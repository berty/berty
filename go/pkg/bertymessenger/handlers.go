package bertymessenger

import (
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"

	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	et := gme.GetMetadata().GetEventType()
	svc.logger.Info("received protocol event", zap.String("type", et.String()))

	var err error
	switch et {
	case bertytypes.EventTypeAccountGroupJoined:
		err = accountGroupJoined(svc, gme)
	case bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:
		err = accountContactRequestOutgoingEnqueued(svc, gme)
	case bertytypes.EventTypeAccountContactRequestOutgoingSent:
		err = accountContactRequestOutgoingSent(svc, gme)
	case bertytypes.EventTypeAccountContactRequestIncomingReceived:
		err = accountContactRequestIncomingReceived(svc, gme)
	case bertytypes.EventTypeAccountContactRequestIncomingAccepted:
		err = accountContactRequestIncomingAccepted(svc, gme)
	case bertytypes.EventTypeGroupMemberDeviceAdded:
		err = groupMemberDeviceAdded(svc, gme)
	case bertytypes.EventTypeGroupMetadataPayloadSent:
		err = groupMetadataPayloadSent(svc, gme)
	default:
		svc.logger.Info("event ignored", zap.String("type", et.String()))
	}

	return err
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

func accountContactRequestOutgoingEnqueued(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkStr := bytesToString(ev.GetContact().GetPK())

	var cm ContactMetadata
	err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
	if err != nil {
		return err
	}

	var exc Contact
	err = svc.db.Where(Contact{PublicKey: pkStr}).Take(&exc).Error
	switch err {
	case gorm.ErrRecordNotFound:
		// do nothing
	case nil: // contact already exists
		// Maybe update DisplayName in some cases?
		// TODO: better handle case where the state is "IncomingRequest", should end up as in "Established" state in this case IMO
		return nil
	default: // any other error
		return err
	}

	c := &Contact{
		DisplayName: cm.DisplayName,
		PublicKey:   pkStr,
		State:       Contact_OutgoingRequestEnqueued,
	}
	err = svc.db.Clauses(clause.OnConflict{DoNothing: true}).Create(c).Error
	if err != nil {
		return err
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{c})
}

func accountGroupJoined(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	pkb := ev.GetGroup().GetPublicKey()
	b64PK := bytesToString(pkb)
	isNew := false

	// get or create conversation in DB
	var conv Conversation
	{
		err := svc.db.
			Where(Conversation{PublicKey: b64PK}).
			First(&conv).
			Error
		switch err {
		case gorm.ErrRecordNotFound: // not found, create a new one
			conv.PublicKey = b64PK
			conv.Type = Conversation_MultiMemberType
			isNew = true
			err := svc.db.
				Clauses(clause.OnConflict{DoNothing: true}).
				Create(&conv).
				Error
			if err != nil {
				return err
			}
			svc.logger.Info("saved conversation in db")

			// dispatch event
			err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conv})
			if err != nil {
				return err
			}

		case nil: // contact already exists
			// noop

		default: // other error
			return err
		}
	}

	svc.logger.Info("AccountGroupJoined", zap.String("pk", b64PK), zap.Bool("is-new", isNew), zap.String("known-as", conv.DisplayName))

	return nil
}

func accountContactRequestOutgoingSent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkb := ev.GetContactPK()
	pkStr := bytesToString(pkb)

	var c Contact
	if err := svc.db.Where(Contact{PublicKey: pkStr}).Take(&c).Error; err != nil {
		return err
	}

	switch c.State {
	case Contact_OutgoingRequestEnqueued:
		c.State = Contact_OutgoingRequestSent
	default:
		return errcode.ErrInternal
	}

	if err := svc.db.Save(c).Error; err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	// dispatch event
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&c})
		if err != nil {
			return err
		}
	}

	groupPK, err := svc.groupPKFromContactPK(pkb)
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
	pkStr := bytesToString(ev.GetContactPK())

	var m ContactMetadata
	err := proto.Unmarshal(ev.GetContactMetadata(), &m)
	if err != nil {
		return err
	}

	c := &Contact{DisplayName: m.GetDisplayName(), PublicKey: pkStr, State: Contact_IncomingRequest}
	err = svc.db.Clauses(clause.OnConflict{DoNothing: true}).Create(c).Error
	if err != nil {
		return err
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{c})
}

func accountContactRequestIncomingAccepted(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestAccepted
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkb := ev.GetContactPK()
	if pkb == nil {
		return errcode.ErrInvalidInput
	}
	pkStr := bytesToString(pkb)

	// retrieve contact from DB
	var contact Contact
	{
		err := svc.db.
			Where(Contact{PublicKey: pkStr}).
			First(&contact).Error
		if err != nil {
			return err
		}
	}

	// update contact state from IncomingRequest to Established
	{
		if contact.State != Contact_IncomingRequest {
			return errcode.ErrInternal
		}
		contact.State = Contact_Established
	}

	// compute account conversation pk
	var groupPK []byte
	{
		var err error
		groupPK, err = svc.groupPKFromContactPK(pkb)
		if err != nil {
			return err
		}
		contact.ConversationPublicKey = bytesToString(groupPK)
	}

	// create new contact conversation
	var conversation Conversation
	{
		conversation = Conversation{
			PublicKey:        contact.ConversationPublicKey,
			Type:             Conversation_ContactType,
			ContactPublicKey: pkStr,
			DisplayName:      "", // empty on account conversations
			Link:             "", // empty on account conversations
		}
	}

	// update db (in transaction)
	{
		err := svc.db.Transaction(func(tx *gorm.DB) error {
			// update existing contact
			if err := tx.Save(&contact).Error; err != nil {
				return err
			}

			// create new conversation
			err := tx.
				Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "public_key"}},
					DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
				}).
				Create(&conversation).
				Error
			return err
		})
		if err != nil {
			return err
		}
	}

	// dispatch event to subscribers
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact})
		if err != nil {
			return err
		}
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conversation})
		if err != nil {
			return err
		}
	}

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(groupPK)))
		}
	}

	// subscribe to group messages
	return svc.subscribeToGroup(groupPK)
}

// groupMemberDeviceAdded is called at different moments
// * on AccountGroup when you add a new device to your group
// * on ContactGroup when you or your contact add a new device
// * on MultiMemberGroup when you or anyone in a multimember group adds a new device
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
	gpk := bytesToString(dpkb)

	isMe, err := svc.checkIsMe(&bertytypes.GroupMessageEvent{
		EventContext: gme.GetEventContext(),
		Headers:      &bertytypes.MessageHeaders{DevicePK: dpkb},
	})
	if err != nil {
		return err
	}
	if isMe {
		svc.logger.Debug("ignoring member device because isMe")
		return nil
	}

	device := Device{
		PublicKey:      dpk,
		OwnerPublicKey: mpk,
	}
	{
		err := svc.db.Where(&Device{PublicKey: dpk}).Take(&Device{}).Error
		if err == gorm.ErrRecordNotFound {
			err = svc.db.
				Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "public_key"}},
					DoNothing: true,
				}).
				Create(&device).
				Error
			if err != nil {
				return err
			}
			err = svc.dispatcher.StreamEvent(StreamEvent_TypeDeviceUpdated, &StreamEvent_DeviceUpdated{Device: &device})
			if err != nil {
				svc.logger.Error("dispatching device updated", zap.Error(err))
			}
		}
	}

	{
		var account Account
		err := svc.db.Take(&account).Error
		if err != nil {
			svc.logger.Warn("account not found")
			svc.logger.Info("device added", zap.String("member", mpk), zap.String("device", dpk))
		} else {
			svc.logger.Info("device added", zap.String("member", mpk), zap.String("device", dpk), zap.String("account", account.GetPublicKey()))
		}
	}

	// fetch contact from db
	var contact Contact
	err = svc.db.
		Where(Contact{PublicKey: mpk}).
		First(&contact).
		Error

	if err == gorm.ErrRecordNotFound {
		nameSuffix := "1337"
		if len(mpk) >= 4 {
			nameSuffix = mpk[:4]
		}
		member := Member{
			PublicKey:             mpk,
			ConversationPublicKey: gpk,
			DisplayName:           "anon#" + nameSuffix,
		}
		err := svc.db.
			Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "public_key"}},
				DoNothing: true,
			}).
			Create(&member).
			Error
		return err
	}

	switch {
	case err == nil && contact.GetState() == Contact_OutgoingRequestSent: // someone you invited just accepted the invitation
		// update contact
		var groupPK []byte
		{
			contact.State = Contact_Established

			var err error
			groupPK, err = svc.groupPKFromContactPK(mpkb)
			if err != nil {
				return err
			}

			contact.ConversationPublicKey = bytesToString(groupPK)
		}

		// create new contact conversation
		var conversation Conversation
		{
			conversation = Conversation{
				PublicKey:        contact.ConversationPublicKey,
				ContactPublicKey: mpk,
				Type:             Conversation_ContactType,
				DisplayName:      "", // empty on account conversations
				Link:             "", // empty on account conversations
			}
		}

		// update db
		{
			err := svc.db.Transaction(func(tx *gorm.DB) error {
				// update existing contact
				if err := tx.Save(&contact).Error; err != nil {
					return err
				}

				// create new conversation
				err := tx.
					Clauses(clause.OnConflict{
						Columns:   []clause.Column{{Name: "public_key"}},
						DoUpdates: clause.AssignmentColumns([]string{"display_name", "link"}),
					}).
					Create(&conversation).
					Error
				return err
			})
			if err != nil {
				return err
			}
		}

		// dispatch events
		{
			err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&contact})
			if err != nil {
				return err
			}
			err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conversation})
			if err != nil {
				return err
			}
		}

		// activate group and subscribe to message events
		{
			_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK})
			if err != nil {
				svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(groupPK)))
			}
		}

		return svc.subscribeToMessages(groupPK)
	case err == nil: // someone you know just added a new device, this happens in
		// nothing to do
	case err != nil: // unknown contact
		// nothing to do
		// FIXME: create a ConversationMember
	}

	return nil
}

func handleAppMessage(svc *service, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) error {
	amt := am.GetType()
	svc.logger.Debug("received app message", zap.String("type", amt.String()))
	cidb := gme.GetEventContext().GetID()
	cid := bytesToString(cidb)
	isMe, err := svc.checkIsMe(gme)
	if err != nil {
		return err
	}
	amPayload, err := am.UnmarshalPayload()
	_ = amPayload // amPayload may be unused, we want to check if the payload can be unmarshaled
	if err != nil {
		return err
	}

	var conv *Conversation
	err = svc.db.Where(&Conversation{PublicKey: gpk}).Take(conv).Error
	if err != nil {
		conv = nil
	}

	dpkb := gme.GetHeaders().GetDevicePK()
	dpk := bytesToString(dpkb)

	next := func(device *Device) error {
		i := &Interaction{
			CID:                   cid,
			Type:                  amt,
			Payload:               am.GetPayload(),
			ConversationPublicKey: gpk,
			IsMe:                  isMe,
			MemberPublicKey:       device.GetOwnerPublicKey(),
		}

		switch amt {
		case AppMessage_TypeAcknowledge:
			// FIXME: set 'Acknowledged: true' on existing interaction instead
			if err := svc.db.Create(i).Error; err != nil {
				return err
			}

			err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i})
			if err != nil {
				return err
			}

		case AppMessage_TypeGroupInvitation:
			if err := svc.db.Create(i).Error; err != nil {
				return err
			}

			err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i})
			if err != nil {
				return err
			}

		case AppMessage_TypeUserMessage:
			if err := svc.db.Create(i).Error; err != nil {
				return err
			}

			if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i}); err != nil {
				return err
			}

			if !isMe {
				svc.logger.Debug("sending ack", zap.String("target", cid))

				// send ack

				// Don't send ack if message is already acked to prevent spam in multimember groups
				// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
				/*var ei Interaction
				err := svc.db.Where("cid = ? AND acknowledged = ?", cid, true).Take(&ei).Error
				if err == gorm.ErrRecordNotFound {
					return nil
				} else if err != nil {
					return err
				}*/

				amp, err := AppMessage_TypeAcknowledge.MarshalPayload(&AppMessage_Acknowledge{Target: cid})
				if err != nil {
					return err
				}
				req := bertytypes.AppMessageSend_Request{
					GroupPK: gme.GetEventContext().GetGroupPK(),
					Payload: amp,
				}
				_, err = svc.protocolClient.AppMessageSend(svc.ctx, &req)
				if err != nil {
					return err
				}
			}
		case AppMessage_TypeSetUserName:
			if isMe {
				return nil
			}

			if device == nil {
				return errcode.ErrMissingInput
			}

			payload := amPayload.(*AppMessage_SetUserName)

			member := Member{
				PublicKey:             device.GetOwnerPublicKey(),
				ConversationPublicKey: gpk,
				DisplayName:           payload.GetName(),
			}
			err := svc.db.
				Clauses(clause.OnConflict{
					Columns:   []clause.Column{{Name: "public_key"}},
					DoUpdates: clause.AssignmentColumns([]string{"display_name"}),
				}).
				Create(&member).
				Error
			if err != nil {
				return err
			}

			return svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{Member: &member})

		default:
			svc.logger.Warn("unsupported app message type", zap.String("type", amt.String()))
		}

		return nil
	}

	if isMe || conv.GetType() == Conversation_ContactType {
		return next(nil)
	}

	existingDevice := &Device{}
	err = svc.db.Where(&Device{PublicKey: dpk}).Take(existingDevice).Error
	if err != nil {
		// Wait for device and hence member pk asynchronously to correctly match message to member
		// Maybe should be better to put in a backlog and empty backlog on member device added
		go func() {
			ch := make(chan *Device)
			defer close(ch)
			unreg := svc.dispatcher.Register(&NotifieeBundle{StreamEventImpl: func(c *StreamEvent) error {
				if c.GetType() == StreamEvent_TypeDeviceUpdated {
					var payload StreamEvent_DeviceUpdated
					err := proto.Unmarshal(c.GetPayload(), &payload)
					if err != nil {
						return err
					}
					if payload.GetDevice().GetPublicKey() == dpk {
						ch <- payload.GetDevice()
					}
				}
				return nil
			}})
			device := <-ch
			unreg()
			svc.handlerMutex.Lock()
			defer svc.handlerMutex.Unlock()
			if err := next(device); err != nil {
				svc.logger.Error("delayed message processing", zap.Error(err))
			}
		}()
		return nil
	} else if err == nil {
		return next(existingDevice)
	}
	return nil
}
