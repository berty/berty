package bertymessenger

import (
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"gorm.io/gorm"
)

func handleProtocolEvent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	switch gme.Metadata.EventType {
	case bertytypes.EventTypeAccountGroupJoined:
		var ev bertytypes.AccountGroupJoined
		if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
			return err
		}
		b64PK := bytesToB64(ev.GetGroup().GetPublicKey())

		var conv Conversation
		err := svc.db.First(&conv).Error
		logStr := "AccountGroupJoined: " + b64PK

		if err == gorm.ErrRecordNotFound {
			conv.PublicKey = b64PK
			svc.logger.Info(logStr)
			return svc.db.Save(conv).Error
		} else if err != nil {
			return err
		}
		logStr += ", already known"
		if conv.DisplayName != "" {
			logStr += " as " + conv.DisplayName
		}
		svc.logger.Info(logStr)

	case bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:
		var ev bertytypes.AccountContactRequestEnqueued
		if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
			return err
		}
		pkStr := bytesToB64(ev.GetContact().GetPK())

		var cm ContactMetadata
		err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
		if err != nil {
			return err
		}

		var exc Contact
		err = svc.db.Where(Contact{PublicKey: pkStr}).First(&exc).Error
		if err != nil {
			if err != gorm.ErrRecordNotFound {
				return err
			}
		} else {
			// Maybe update DisplayName in some cases?
			// TODO: better handle case where the state is "IncomingRequest", should end up as in "Established" state in this case IMO
			return nil
		}

		c := &Contact{DisplayName: cm.DisplayName, PublicKey: pkStr, State: Contact_OutgoingRequestEnqueued}
		err = svc.db.Save(c).Error
		if err != nil {
			return err
		}

		p, err := proto.Marshal(&StreamEvent_ContactUpdated{c})
		if err != nil {
			return err
		}
		svc.dispatcher.StreamEvent(&StreamEvent{Type: StreamEvent_TypeContactUpdated, Payload: p})
	}
	return nil
}
