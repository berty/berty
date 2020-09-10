package bertymessenger

import (
	"time"

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

func accountGroupJoined(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	gpkb := ev.GetGroup().GetPublicKey()
	groupPK := bytesToString(gpkb)
	isNew := false

	conversation, err := addConversation(svc.db, groupPK)
	if err == nil {
		isNew = true
		svc.logger.Info("saved conversation in db")

		// dispatch event
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conversation})
		if err != nil {
			return err
		}
	} else if !errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return errcode.ErrDBAddConversation.Wrap(err)
	}

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
		if err != nil {
			svc.logger.Warn("failed to activate group", zap.String("pk", bytesToString(gpkb)))
		}
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

	contact, err := addContactRequestOutgoingEnqueued(svc.db, contactPK, cm.DisplayName, gpk)
	if errcode.Is(err, errcode.ErrDBEntryAlreadyExists) {
		return nil
	} else if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingEnqueud.Wrap(err)
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
}

func accountContactRequestOutgoingSent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	contactPK := bytesToString(ev.GetContactPK())

	contact, err := addContactRequestOutgoingSent(svc.db, contactPK)
	if err != nil {
		return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
	}

	// dispatch event
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
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

	contact, err := addContactRequestIncomingReceived(svc.db, contactPK, m.GetDisplayName())
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
	}

	return svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
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

	contact, conversation, err := addContactRequestIncomingAccepted(svc.db, contactPK, bytesToString(groupPK))
	if err != nil {
		return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
	}

	// dispatch event to subscribers
	{
		err := svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{contact})
		if err != nil {
			return err
		}
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{conversation})
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

	isMe, err := checkIsMe(
		svc.ctx,
		svc.protocolClient,
		&bertytypes.GroupMessageEvent{
			EventContext: gme.GetEventContext(),
			Headers:      &bertytypes.MessageHeaders{DevicePK: dpkb},
		},
	)
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
		_, err = getDevice(svc.db, dpk)
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
				svc.logger.Error("error dispatching device updated", zap.Error(err))
			}
		}
	}

	{
		account, err := getAccount(svc.db)
		if err != nil {
			svc.logger.Warn("account not found")
			svc.logger.Debug("device added", zap.String("member", mpk), zap.String("device", dpk))
		} else {
			svc.logger.Debug("device added", zap.String("member", mpk), zap.String("device", dpk), zap.String("account", account.GetPublicKey()))
		}
	}

	// fetch contact from db (include in tranaction maybe?)
	contact, err := getContact(svc.db, mpk)

	if err == nil && contact.GetState() == Contact_OutgoingRequestSent {
		// someone you invited just accepted the invitation
		// update contact
		var groupPK []byte
		{
			contact.State = Contact_Established

			var err error
			groupPK, err = groupPKFromContactPK(svc.ctx, svc.protocolClient, mpkb)
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
				CreatedDate:      timestampMs(time.Now()),
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
	}

	nameSuffix := "1337"
	if len(mpk) >= 4 {
		nameSuffix = mpk[:4]
	}
	member := Member{
		PublicKey:             mpk,
		ConversationPublicKey: gpk,
		DisplayName:           "anon#" + nameSuffix,
	}
	claus := clause.OnConflict{
		Columns:   []clause.Column{{Name: "public_key"}},
		DoNothing: true,
	}

	// check backlogs
	{
		var backlog []Interaction
		err := svc.db.
			Order("arrival_index asc").
			Where("device_public_key = ? AND conversation_public_key = ? AND member_public_key = ?", dpk, gpk, "").
			Find(&backlog).
			Error
		if err == gorm.ErrRecordNotFound {
			return nil
		} else if err != nil {
			return err
		}
		for _, elem := range backlog {
			svc.logger.Info("found elem in backlog", zap.String("type", elem.GetType().String()), zap.String("device-pk", elem.GetDevicePublicKey()), zap.String("conv", elem.GetConversationPublicKey()))

			elem.MemberPublicKey = mpk

			switch elem.GetType() {
			case AppMessage_TypeSetUserName:
				var payload AppMessage_SetUserName
				err := proto.Unmarshal(elem.GetPayload(), &payload)
				if err != nil {
					return err
				}
				member = Member{
					PublicKey:             mpk,
					ConversationPublicKey: gpk,
					DisplayName:           payload.GetName(),
				}
				claus = clause.OnConflict{
					Columns:   []clause.Column{{Name: "public_key"}},
					DoUpdates: clause.AssignmentColumns([]string{"display_name"}),
				}
				err = svc.db.Where(&Interaction{CID: elem.GetCID()}).Delete(&Interaction{}).Error
				if err != nil {
					return err
				}
				err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{elem.GetCID()})
				if err != nil {
					return err
				}
			default:
				e := elem // comply with scopelint
				err := svc.db.Save(&e).Error
				if err != nil {
					return err // maybe only log here
				}
				err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{&e})
				if err != nil {
					return err
				}
			}
		}

		err = svc.db.Clauses(&claus).Create(&member).Error
		if err != nil {
			return err
		}
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{&member})
		if err != nil {
			return err
		}
		svc.logger.Info("dispatched member update", zap.String("name", member.GetDisplayName()), zap.String("conv", gpk))
	}

	return nil
}

// nolint:gocyclo
func handleAppMessage(svc *service, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) error {
	svc.logger.Info("handling app message", zap.String("type", am.GetType().String()))
	// build interaction
	var i *Interaction
	{
		amt := am.GetType()
		cidb := gme.GetEventContext().GetID()
		cid := bytesToString(cidb)
		isMe, err := checkIsMe(svc.ctx, svc.protocolClient, gme)
		if err != nil {
			return err
		}

		dpkb := gme.GetHeaders().GetDevicePK()
		dpk := bytesToString(dpkb)

		i = &Interaction{
			CID:                   cid,
			Type:                  amt,
			Payload:               am.GetPayload(),
			IsMe:                  isMe,
			ConversationPublicKey: gpk,
			SentDate:              am.GetSentDate(),
			DevicePublicKey:       dpk,
		}
		svc.logger.Debug("received app message", zap.String("type", amt.String()))
	}

	// parse payload
	var amPayload proto.Message
	{
		var err error
		amPayload, err = am.UnmarshalPayload()
		_ = amPayload // amPayload may be unused, we want to check if the payload can be unmarshaled without error
		if err != nil {
			return err
		}
	}

	// fetch conv from db
	var conv Conversation
	{
		var err error
		conv, err = getConversation(svc.db, gpk)
		if err != nil {
			// FIXME: maybe we should accept receiving app messages on unknown conversations?
			svc.logger.Warn("ignored message because conv not found")
			return err
		}
	}

	// start a transaction
	{
		err := svc.db.Transaction(func(tx *gorm.DB) error {
			// build device
			{
				dpkb := gme.GetHeaders().GetDevicePK()
				dpk := bytesToString(dpkb)

				switch {
				case i.IsMe: // myself
					i.MemberPublicKey = ""
				case conv.GetType() == Conversation_ContactType: // 1-1 conversation
					i.MemberPublicKey = ""
					// FIXME: multiple devices per contact?
				default:
					existingDevice, err := getDevice(tx, dpk)
					if err == nil { // device already exists
						i.MemberPublicKey = existingDevice.GetOwnerPublicKey()
					} else { // device not found
						i.MemberPublicKey = "" // backlog magic
					}
				}
			}

			// extract ack from backlog
			{
				var acks []Interaction
				err := tx.Where(&Interaction{Type: AppMessage_TypeAcknowledge}).Find(&acks).Error
				if err != nil {
					return err
				}
				for _, ack := range acks {
					payload, err := ack.UnmarshalPayload()
					if err != nil {
						return err
					}
					ackPayload := payload.(*AppMessage_Acknowledge)
					if i.GetCID() == ackPayload.GetTarget() {
						i.Acknowledged = true
						svc.logger.Debug("found ack in backlog", zap.String("target", ackPayload.GetTarget()), zap.String("cid", i.GetCID()))
						err := tx.Where(&Interaction{CID: ack.GetCID()}).Delete(&Interaction{}).Error
						if err != nil {
							return err
						}
						err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionDeleted, &StreamEvent_InteractionDeleted{ack.GetCID()})
						if err != nil {
							return err
						}
					}
				}
			}

			isVisibleEvent := false

			switch i.GetType() {
			case AppMessage_TypeAcknowledge:
				payload := amPayload.(*AppMessage_Acknowledge)

				// find target
				target, err := getInteraction(tx, payload.GetTarget())
				if err == gorm.ErrRecordNotFound {
					// add ack in db (backlog)
					if err := tx.Create(i).Error; err != nil {
						return err
					}
					svc.logger.Debug("added ack in backlog", zap.String("target", payload.GetTarget()), zap.String("cid", i.GetCID()))
					break
				} else if err != nil {
					return err
				}

				// set ack on target
				target.Acknowledged = true
				if err := tx.Model(&Interaction{}).Where("c_id = ?", target.GetCID()).Update("acknowledged", true).Error; err != nil {
					return err
				}

				// dispatch updated target
				err = svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{&target})
				if err != nil {
					return err
				}

			case AppMessage_TypeGroupInvitation:
				isVisibleEvent = true

				if err := tx.Create(i).Error; err != nil {
					return err
				}

				err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i})
				if err != nil {
					return err
				}

			case AppMessage_TypeUserMessage:
				isVisibleEvent = true

				if err := tx.Create(i).Error; err != nil {
					return err
				}

				if err := svc.dispatcher.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{i}); err != nil {
					return err
				}

				if !i.IsMe {
					svc.logger.Debug("sending ack", zap.String("target", i.CID))

					// send ack

					// Don't send ack if message is already acked to prevent spam in multimember groups
					// Maybe wait a few seconds before checking since we're likely to receive the message before any ack
					amp, err := AppMessage_TypeAcknowledge.MarshalPayload(0, &AppMessage_Acknowledge{Target: i.CID})
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
				if i.IsMe {
					svc.logger.Info("ignoring SetUserName because isMe")
					break
				}

				svc.logger.Debug("interesting SetUserName")

				payload := amPayload.(*AppMessage_SetUserName)

				if i.MemberPublicKey == "" {
					// store in backlog
					svc.logger.Info("storing SetUserName in backlog", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", gpk))
					return tx.
						Clauses(clause.OnConflict{
							Columns:   []clause.Column{{Name: "c_id"}},
							DoNothing: true,
						}).
						Create(&i).
						Error
				}

				member := Member{
					PublicKey:             i.MemberPublicKey,
					ConversationPublicKey: gpk,
					DisplayName:           payload.GetName(),
				}
				err := tx.
					Clauses(clause.OnConflict{
						Columns:   []clause.Column{{Name: "public_key"}},
						DoUpdates: clause.AssignmentColumns([]string{"display_name"}),
					}).
					Create(&member).
					Error
				if err != nil {
					return err
				}

				err = svc.dispatcher.StreamEvent(StreamEvent_TypeMemberUpdated, &StreamEvent_MemberUpdated{Member: &member})
				if err != nil {
					return err
				}

				svc.logger.Debug("dispatched member update", zap.String("name", payload.GetName()), zap.String("device-pk", i.GetDevicePublicKey()), zap.String("conv", gpk))

			default:
				svc.logger.Warn("unsupported app message type", zap.String("type", i.GetType().String()))
			}

			if isVisibleEvent {
				// FIXME: check if app is in foreground

				// fetch conversation from db
				conv, err := getConversation(tx, conv.GetPublicKey())
				if err != nil {
					return err
				}

				// visible events update the last_update field
				updates := map[string]interface{}{
					"last_update": timestampMs(time.Now()),
				}

				// if conv is not open, increment the unread_count
				if !i.IsMe && !conv.GetIsOpen() {
					updates["unread_count"] = gorm.Expr("unread_count + 1")
				}

				// db update
				err = tx.Model(&conv).Updates(updates).Error
				if err != nil {
					return err
				}

				// expr-based (see above) gorm updates don't update the go object
				// next query could be easily replace by a simple increment, but this way we're 100% sure to be up-to-date
				conv, err = getConversation(tx, i.GetConversationPublicKey())
				if err != nil {
					return err
				}

				// dispatch update event
				if err := svc.dispatcher.StreamEvent(StreamEvent_TypeConversationUpdated, &StreamEvent_ConversationUpdated{&conv}); err != nil {
					return err
				}
			}

			return nil
		})
		if err != nil { // something failed during the transaction
			return err
		}
	}
	return nil
}
