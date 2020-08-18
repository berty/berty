package bertymessenger

import (
	"encoding/base64"
	"io"

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
	switch et {
	case bertytypes.EventTypeAccountGroupJoined:
		if err := accountGroupJoined(svc, gme); err != nil {
			return err
		}
	case bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:
		if err := accountContactRequestOutgoingEnqueued(svc, gme); err != nil {
			return err
		}
	case bertytypes.EventTypeAccountContactRequestOutgoingSent:
		if err := accountContactRequestOutgoingSent(svc, gme); err != nil {
			return err
		}
	case bertytypes.EventTypeAccountContactRequestIncomingReceived:
		if err := accountContactRequestIncomingReceived(svc, gme); err != nil {
			return err
		}
	case bertytypes.EventTypeAccountContactRequestIncomingAccepted:
		if err := accountContactRequestIncomingAccepted(svc, gme); err != nil {
			return err
		}
	case bertytypes.EventTypeGroupMemberDeviceAdded:
		if err := groupMemberDeviceAdded(svc, gme); err != nil {
			return err
		}
	default:
		svc.logger.Info("event ignored", zap.String("type", et.String()))
	}
	return nil
}

func accountContactRequestOutgoingEnqueued(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestEnqueued
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkStr := base64.StdEncoding.EncodeToString(ev.GetContact().GetPK())

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

	p, err := proto.Marshal(&StreamEvent_ContactUpdated{c})
	if err != nil {
		return err
	}
	svc.dispatcher.StreamEvent(&StreamEvent{Type: StreamEvent_TypeContactUpdated, Payload: p})

	return nil
}

func accountGroupJoined(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountGroupJoined
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkb := ev.GetGroup().GetPublicKey()
	b64PK := base64.StdEncoding.EncodeToString(pkb)

	var conv Conversation
	err := svc.db.Where(Conversation{PublicKey: b64PK}).First(&conv).Error

	isNew := false

	if err == gorm.ErrRecordNotFound {
		conv.PublicKey = b64PK
		isNew = true
		if err := svc.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&conv).Error; err != nil {
			return err
		}
		svc.logger.Info("saved conv to db")
		payload, err := proto.Marshal(&StreamEvent_ConversationUpdated{&conv})
		if err != nil {
			return err
		}
		if errs := svc.dispatcher.StreamEvent(&StreamEvent{StreamEvent_TypeConversationUpdated, payload}); len(errs) > 0 {
			return errs[0] // TODO: pass all errors
		}
	} else if err != nil {
		return err
	}

	_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: pkb})
	if err != nil {
		return err
	}

	s, err := svc.protocolClient.GroupMetadataSubscribe(svc.ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: pkb})
	if err != nil {
		return err
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				switch {
				case err == io.EOF:
					svc.logger.Warn("group metadata stream EOF")
				case grpcIsCanceled(err):
					svc.logger.Debug("group metadata stream canceled")
				default:
					svc.logger.Error("receive from group metadata stream", zap.Error(err))
				}
				return
			}
			err = handleProtocolEvent(svc, gme)
			if err != nil {
				svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
		}
	}()

	ms, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: pkb})
	if err != nil {
		return err
	}
	go func() {
		for {
			gme, err := ms.Recv()
			if err != nil {
				switch {
				case err == io.EOF:
					svc.logger.Warn("group message stream EOF")
				case grpcIsCanceled(err):
					svc.logger.Debug("group message stream canceled")
				default:
					svc.logger.Error("receive from group message stream", zap.Error(err))
				}
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

	return nil
}

func accountContactRequestOutgoingSent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestSent
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkb := ev.GetContactPK()
	pkStr := base64.StdEncoding.EncodeToString(pkb)

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

	cu, err := proto.Marshal(&StreamEvent_ContactUpdated{&c})
	if err != nil {
		return err
	}
	svc.dispatcher.StreamEvent(&StreamEvent{StreamEvent_TypeContactUpdated, cu})

	gir, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{ContactPK: pkb})
	if err != nil {
		return err
	}

	gpkb := gir.GetGroup().GetPublicKey()
	if gpkb == nil {
		return errcode.ErrInternal
	}

	_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
	if err != nil {
		return err
	}

	s, err := svc.protocolClient.GroupMetadataSubscribe(svc.ctx, &bertytypes.GroupMetadataSubscribe_Request{GroupPK: gpkb})
	if err != nil {
		svc.logger.Error("WTF", zap.Error(err))
		return err
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				switch {
				case err == io.EOF:
					svc.logger.Warn("group stream EOF")
				case grpcIsCanceled(err):
					svc.logger.Debug("group stream canceled")
				default:
					svc.logger.Error("receive from group metadata stream", zap.Error(err))
				}
				return
			}
			err = handleProtocolEvent(svc, gme)
			if err != nil {
				svc.logger.Error("failed to handle protocol event", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
		}
	}()

	return nil
}

func accountContactRequestIncomingReceived(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	var ev bertytypes.AccountContactRequestReceived
	if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
		return err
	}
	pkStr := base64.StdEncoding.EncodeToString(ev.GetContactPK())

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

	cu, err := proto.Marshal(&StreamEvent_ContactUpdated{c})
	if err != nil {
		return err
	}
	svc.dispatcher.StreamEvent(&StreamEvent{StreamEvent_TypeContactUpdated, cu})

	return nil
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
	pkStr := base64.StdEncoding.EncodeToString(pkb)

	var c Contact
	if err := svc.db.Where(Contact{PublicKey: pkStr}).First(&c).Error; err != nil {
		return err
	}

	if c.State != Contact_IncomingRequest {
		return errcode.ErrInternal
	}

	c.State = Contact_Established

	gir, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{ContactPK: pkb})
	if err != nil {
		return err
	}
	gpkb := gir.GetGroup().GetPublicKey()
	if gpkb == nil {
		return errcode.ErrInternal
	}
	gpk := base64.StdEncoding.EncodeToString(gpkb)
	c.ConversationPublicKey = gpk

	if err := svc.db.Save(&c).Error; err != nil {
		return err
	}

	cu, err := proto.Marshal(&StreamEvent_ContactUpdated{&c})
	if err != nil {
		return err
	}
	svc.dispatcher.StreamEvent(&StreamEvent{StreamEvent_TypeContactUpdated, cu})

	_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
	if err != nil {
		return err
	}

	s, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: gpkb})
	if err != nil {
		return err
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				switch {
				case err == io.EOF:
					svc.logger.Warn("group message stream EOF")
				case grpcIsCanceled(err):
					svc.logger.Debug("group message stream canceled")
				default:
					svc.logger.Error("receive from group message stream", zap.Error(err))
				}
				return
			}
			var am AppMessage
			if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
				svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
				return
			}
			err = handleAppMessage(svc, gpk, gme, &am)
			if err != nil {
				svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
			}
		}
	}()
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
	mpk := base64.StdEncoding.EncodeToString(mpkb)
	var c Contact
	if err := svc.db.Where(Contact{PublicKey: mpk}).First(&c).Error; err == nil && c.GetState() == Contact_OutgoingRequestSent {
		c.State = Contact_Established

		gir, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{ContactPK: mpkb})
		if err != nil {
			return err
		}
		gpkb := gir.GetGroup().GetPublicKey()
		if gpkb == nil {
			return errcode.ErrInternal
		}
		gpk := base64.StdEncoding.EncodeToString(gpkb)
		c.ConversationPublicKey = gpk

		if err := svc.db.Save(&c).Error; err != nil {
			return err
		}

		cu, err := proto.Marshal(&StreamEvent_ContactUpdated{&c})
		if err != nil {
			return err
		}
		svc.dispatcher.StreamEvent(&StreamEvent{StreamEvent_TypeContactUpdated, cu})

		_, err = svc.protocolClient.ActivateGroup(svc.ctx, &bertytypes.ActivateGroup_Request{GroupPK: gpkb})
		if err != nil {
			return err
		}

		s, err := svc.protocolClient.GroupMessageSubscribe(svc.ctx, &bertytypes.GroupMessageSubscribe_Request{GroupPK: gpkb})
		if err != nil {
			return errcode.TODO.Wrap(err)
		}
		go func() {
			for {
				gme, err := s.Recv()
				if err != nil {
					switch {
					case err == io.EOF:
						svc.logger.Warn("group message stream EOF")
					case grpcIsCanceled(err):
						svc.logger.Debug("group message stream canceled")
					default:
						svc.logger.Error("receive from group message stream", zap.Error(err))
					}
					return
				}
				var am AppMessage
				if err := proto.Unmarshal(gme.GetMessage(), &am); err != nil {
					svc.logger.Warn("failed to unmarshal AppMessage", zap.Error(err))
					return
				}
				err = handleAppMessage(svc, gpk, gme, &am)
				if err != nil {
					svc.logger.Error("failed to handle app message", zap.Error(errcode.ErrInternal.Wrap(err)))
				}
			}
		}()
	}
	return nil
}
