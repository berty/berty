package bertymessenger

import (
	"bytes"
	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	// "gorm.io/gorm"

	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"go.uber.org/zap"
)

func checkIsMe(svc *service, gme *bertytypes.GroupMessageEvent) (bool, error) {
	gpkb := gme.GetEventContext().GetGroupPK()

	// TODO: support multiple devices per account
	gi, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return false, err
	}

	dpk := gi.GetDevicePK()
	mdpk := gme.GetHeaders().GetDevicePK()

	return bytes.Equal(dpk, mdpk), nil
}

func handleAppMessage(svc *service, gpk string, gme *bertytypes.GroupMessageEvent, am *AppMessage) error {
	amt := am.GetType()
	svc.logger.Info("received app message", zap.String("type", amt.String()))
	cidb := gme.GetEventContext().GetID()
	cid := base64.StdEncoding.EncodeToString(cidb)
	switch amt {
	case AppMessage_TypeAcknowledge:
		// FIXME: set 'Acknowledged: true' on existing interaction instead

		var p AppMessage_Acknowledge
		if err := proto.Unmarshal(am.GetPayload(), &p); err != nil {
			return err
		}
		isMe, err := checkIsMe(svc, gme)
		if err != nil {
			return err
		}
		i := &Interaction{Cid: cid, Type: amt, Payload: am.GetPayload(), ConversationPublicKey: gpk, IsMe: isMe}
		if err := svc.db.Create(i).Error; err != nil {
			return err
		}
		fp, err := proto.Marshal(&StreamEvent_InteractionUpdated{i})
		if err != nil {
			return err
		}
		svc.dispatcher.StreamEvent(&StreamEvent{
			Type:    StreamEvent_TypeInteractionUpdated,
			Payload: fp,
		})

	case AppMessage_TypeGroupInvitation:
		var p AppMessage_GroupInvitation
		if err := proto.Unmarshal(am.GetPayload(), &p); err != nil {
			return err
		}
		isMe, err := checkIsMe(svc, gme)
		if err != nil {
			return err
		}
		i := &Interaction{Cid: cid, Type: amt, Payload: am.GetPayload(), ConversationPublicKey: gpk, IsMe: isMe}
		if err := svc.db.Create(i).Error; err != nil {
			return err
		}
		fp, err := proto.Marshal(&StreamEvent_InteractionUpdated{i})
		if err != nil {
			return err
		}
		svc.dispatcher.StreamEvent(&StreamEvent{
			Type:    StreamEvent_TypeInteractionUpdated,
			Payload: fp,
		})

	case AppMessage_TypeUserMessage:
		var p AppMessage_UserMessage
		if err := proto.Unmarshal(am.GetPayload(), &p); err != nil {
			return err
		}
		isMe, err := checkIsMe(svc, gme)
		if err != nil {
			return err
		}
		i := &Interaction{Cid: cid, Type: amt, Payload: am.GetPayload(), ConversationPublicKey: gpk, IsMe: isMe}
		if err := svc.db.Create(i).Error; err != nil {
			return err
		}
		fp, err := proto.Marshal(&StreamEvent_InteractionUpdated{i})
		if err != nil {
			return err
		}
		svc.dispatcher.StreamEvent(&StreamEvent{
			Type:    StreamEvent_TypeInteractionUpdated,
			Payload: fp,
		})

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
		svc.logger.Info("app message ignored", zap.String("type", amt.String()))
	}
	return nil
}
