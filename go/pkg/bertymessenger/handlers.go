package bertymessenger

import (
	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func handleProtocolEvent(svc *service, gme *bertytypes.GroupMetadataEvent) error {
	switch gme.Metadata.EventType {
	case bertytypes.EventTypeAccountGroupJoined:
		var ev bertytypes.AccountGroupJoined
		if err := proto.Unmarshal(gme.GetEvent(), &ev); err != nil {
			return err
		}
		b64PK := base64.StdEncoding.EncodeToString(ev.GetGroup().GetPublicKey())

		var conv Conversation
		err := svc.db.First(&conv).Error

		if err == gorm.ErrRecordNotFound {
			conv.PublicKey = b64PK
			svc.logger.Info("AccountGroupJoined", zap.String("pk", b64PK), zap.Bool("is-new", true))
			return svc.db.Save(conv).Error
		} else if err != nil {
			return err
		}
		svc.logger.Info("AccountGroupJoined", zap.String("pk", b64PK), zap.Bool("is-new", false), zap.String("known-as", conv.DisplayName))

	case bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:
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
