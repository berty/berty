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
	default:
		svc.logger.Info("event ignored", zap.String("type", et.String()))
	}

	return err
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
	err = svc.db.Where(Contact{PublicKey: pkStr}).First(&exc).Error
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

	c := &Contact{DisplayName: cm.DisplayName, PublicKey: pkStr, State: Contact_OutgoingRequestEnqueued}
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
		err := svc.db.Where(Conversation{PublicKey: b64PK}).First(&conv).Error
		switch err {
		case gorm.ErrRecordNotFound: // not found, create a new one
			conv.PublicKey = b64PK
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

	// activate group
	{
		_, err := svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: pkb})
		if err != nil {
			return err
		}
	}

	// subscribe to new metadata events
	{
		s, err := svc.protocolClient.GroupMetadataSubscribe(svc.ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: pkb})
		if err != nil {
			return err
		}
		go func() {
			for {
				gme, err := s.Recv()
				if err != nil {
					svc.logStreamingError("group metadata", err)
					return
				}
				err = handleProtocolEvent(svc, gme)
				if err != nil {
					svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
				}
			}
		}()
	}

	// subscribe to new message events
	{
		ms, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: pkb})
		if err != nil {
			return err
		}
		go func() {
			for {
				gme, err := ms.Recv()
				if err != nil {
					svc.logStreamingError("group message", err)
					return
				}

				var am AppMessage
				if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
					svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
					return
				}
				err = handleAppMessage(svc, b64PK, gme, &am)
				if err != nil {
					svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
				}
			}
		}()
		svc.logger.Info("AccountGroupJoined", zap.String("pk", b64PK), zap.Bool("is-new", isNew), zap.String("known-as", conv.DisplayName))
	}

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
	if err := svc.db.Where(Contact{PublicKey: pkStr}).First(&c).Error; err != nil {
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
			return err
		}

		s, err := svc.protocolClient.GroupMetadataSubscribe(svc.ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: groupPK})
		if err != nil {
			svc.logger.Error("WTF", zap.Error(err))
			return err
		}
		go func() {
			for {
				gme, err := s.Recv()
				if err != nil {
					svc.logStreamingError("group metadata", err)
					return
				}

				err = handleProtocolEvent(svc, gme)
				if err != nil {
					svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
				}
			}
		}()
	}

	return nil
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
	var c Contact
	{
		err := svc.db.
			Where(Contact{PublicKey: pkStr}).
			First(&c).Error
		if err != nil {
			return err
		}
	}

	if c.State != Contact_IncomingRequest {
		return errcode.ErrInternal
	}
	c.State = Contact_Established

	groupPK, err := svc.groupPKFromContactPK(pkb)
	if err != nil {
		return err
	}
	c.ConversationPublicKey = bytesToString(groupPK)

	if err := svc.db.Save(&c).Error; err != nil {
		return err
	}

	// dispatch event
	err = svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&c})
	if err != nil {
		return err
	}

	// activate group
	_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK})
	if err != nil {
		return err
	}

	// subscribe to group metadata
	{
		s, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: groupPK})
		if err != nil {
			return err
		}
		go func() {
			for {
				gme, err := s.Recv()
				if err != nil {
					svc.logStreamingError("group message", err)
					return
				}

				var am AppMessage
				if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
					svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
					return
				}
				err = handleAppMessage(svc, c.ConversationPublicKey, gme, &am)
				if err != nil {
					svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
				}
			}
		}()
	}

	return nil
}

func groupMemberDeviceAdded(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.GroupAddMemberDevice
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}

	mpkb := ev.GetMemberPK()
	if mpkb == nil {
		return errcode.ErrInvalidInput
	}
	mpk := bytesToString(mpkb)

	var c Contact
	err := svc.db.Where(Contact{PublicKey: mpk}).First(&c).Error

	if err == nil && c.GetState() == Contact_OutgoingRequestSent {
		c.State = Contact_Established

		groupPK, err := svc.groupPKFromContactPK(mpkb)
		if err != nil {
			return err
		}
		c.ConversationPublicKey = bytesToString(groupPK)

		if err := svc.db.Save(&c).Error; err != nil {
			return err
		}

		// dispatch event
		err = svc.dispatcher.StreamEvent(StreamEvent_TypeContactUpdated, &StreamEvent_ContactUpdated{&c})
		if err != nil {
			return err
		}

		// activate group and subscribe to message events
		{
			_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: groupPK})
			if err != nil {
				return err
			}

			s, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: groupPK})
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			go func() {
				for {
					gme, err := s.Recv()
					if err != nil {
						svc.logStreamingError("group message", err)
						return
					}

					var am AppMessage
					if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
						svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
						return
					}
					err = handleAppMessage(svc, c.ConversationPublicKey, gme, &am)
					if err != nil {
						svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
					}
				}
			}()
		}
	}
	// FIXME: elseif
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

	i := &Interaction{
		Cid:                   cid,
		Type:                  amt,
		Payload:               am.GetPayload(),
		ConversationPublicKey: gpk,
		IsMe:                  isMe,
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

			ackp, err := proto.Marshal(&AppMessage_Acknowledge{Target: cid})
			if err != nil {
				return err
			}
			amp, err := proto.Marshal(&AppMessage{Type: AppMessage_TypeAcknowledge, Payload: ackp})
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

	default:
		svc.logger.Warn("unsupported app message type", zap.String("type", amt.String()))
	}
	return nil
}
