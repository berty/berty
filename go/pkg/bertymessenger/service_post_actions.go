package bertymessenger

import (
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/logutil"
	"berty.tech/weshnet/v2/pkg/tyber"
)

type serviceEventHandlerPostActions struct {
	svc *service
}

func newPostActionsService(svc *service) messengertypes.EventHandlerPostActions {
	return &serviceEventHandlerPostActions{
		svc: svc,
	}
}

func (p *serviceEventHandlerPostActions) ConversationJoined(conversation *messengertypes.Conversation) error {
	gpkb, err := messengerutil.B64DecodeBytes(conversation.PublicKey)
	if err != nil {
		return errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	// activate group
	if err := p.svc.ActivateGroup(gpkb); err != nil {
		p.svc.logger.Warn("failed to activate group", logutil.PrivateString("pk", messengerutil.B64EncodeBytes(gpkb)))
	}

	acc, err := p.svc.db.GetAccount()
	if err != nil {
		return errcode.ErrCode_ErrBertyAccountDataNotFound.Wrap(err)
	}
	if acc.AutoSharePushTokenFlag {
		if _, err := p.svc.PushShareTokenForConversation(p.svc.ctx, &messengertypes.PushShareTokenForConversation_Request{ConversationPk: conversation.PublicKey}); err != nil {
			p.svc.logger.Error("unable to send push token to conversation", zap.Error(err), zap.String("conversation-pk", conversation.PublicKey))
		}
	}

	return nil
}

func (p serviceEventHandlerPostActions) ContactConversationJoined(contact *messengertypes.Contact) error {
	contactPKB, err := messengerutil.B64DecodeBytes(contact.PublicKey)
	if err != nil {
		return errcode.ErrCode_ErrDeserialization.Wrap(err)
	}

	if err := p.svc.ActivateContactGroup(contactPKB); err != nil {
		p.svc.logger.Warn("Failed to activate group", tyber.FormatStepLogFields(p.svc.ctx, []tyber.Detail{
			{Name: "Error", Description: err.Error()},
			{Name: "GroupPublicKey", Description: contact.PublicKey},
		})...)
	}

	// FIXME: if multiple devices, will be sent multiple times
	if err := p.svc.sendAccountUserInfo(p.svc.ctx, contact.ConversationPublicKey); err != nil {
		p.svc.logger.Error("Failed to set user info after joining a contact group", tyber.FormatStepLogFields(p.svc.ctx, []tyber.Detail{
			{Name: "Error", Description: err.Error()},
			{Name: "GroupPublicKey", Description: contact.ConversationPublicKey},
		})...)
	}

	acc, err := p.svc.db.GetAccount()
	if err != nil {
		return errcode.ErrCode_ErrBertyAccountDataNotFound.Wrap(err)
	}
	if acc.AutoSharePushTokenFlag {
		if _, err := p.svc.PushShareTokenForConversation(p.svc.ctx, &messengertypes.PushShareTokenForConversation_Request{ConversationPk: contact.ConversationPublicKey}); err != nil {
			p.svc.logger.Error("unable to send push token to contact", zap.Error(err), logutil.PrivateString("contact-pk", contact.PublicKey))
		}
	}

	return nil
}

func (p *serviceEventHandlerPostActions) InteractionReceived(i *messengertypes.Interaction) error {
	if err := p.svc.SendAck(i.Cid, i.ConversationPublicKey); err != nil {
		p.svc.logger.Error("error while sending ack", logutil.PrivateString("public-key", i.ConversationPublicKey), logutil.PrivateString("cid", i.Cid), zap.Error(err))
	}

	return nil
}

func (p *serviceEventHandlerPostActions) PushServerOrTokenRegistered(account *messengertypes.Account) error {
	if !account.AutoSharePushTokenFlag {
		return nil
	}

	return p.svc.pushDeviceTokenBroadcast(p.svc.ctx)
}
