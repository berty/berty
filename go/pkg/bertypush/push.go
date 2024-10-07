package bertypush

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/dbfetcher"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

type EventHandler interface {
	HandleOutOfStoreAppMessage(groupPK []byte, message *protocoltypes.OutOfStoreMessage, payload []byte) (*messengertypes.Interaction, bool, error)
}

type messengerPushReceiver struct {
	logger       *zap.Logger
	pushHandler  PushHandler
	eventHandler EventHandler
	dbFetcher    dbfetcher.DBFetcher
}

type MessengerPushReceiver interface {
	PushReceive(ctx context.Context, input []byte) (*messengertypes.PushReceive_Reply, error)
}

func NewPushReceiver(pushHandler PushHandler, evtHandler EventHandler, dbFetcher dbfetcher.DBFetcher, logger *zap.Logger) MessengerPushReceiver {
	if logger == nil {
		logger = zap.NewNop()
	}

	return &messengerPushReceiver{
		logger:       logger,
		pushHandler:  pushHandler,
		eventHandler: evtHandler,
		dbFetcher:    dbFetcher,
	}
}

func (m *messengerPushReceiver) PushReceive(ctx context.Context, input []byte) (*messengertypes.PushReceive_Reply, error) {
	oosMessage, err := m.pushHandler.PushReceive(ctx, input)
	if err != nil {
		return nil, errcode.ErrCode_ErrInternal.Wrap(err)
	}

	i, isNew, err := m.eventHandler.HandleOutOfStoreAppMessage(oosMessage.GroupPublicKey, oosMessage.Message, oosMessage.Cleartext)
	if err != nil {
		return nil, errcode.ErrCode_ErrInternal.Wrap(err)
	}

	if i.Conversation.Type == messengertypes.Conversation_ContactType {
		i.Conversation.Contact, err = m.dbFetcher.GetContactByPK(i.Conversation.ContactPublicKey)
		if err != nil {
			m.logger.Error("failed to get push notif contact", zap.Error(err))
		}
	}

	accountMuted, conversationMuted, err := m.dbFetcher.GetMuteStatusForConversation(i.ConversationPublicKey)
	if err != nil {
		accountMuted = true
		conversationMuted = true
	}

	hidePreview := true
	account, err := m.dbFetcher.GetAccount()
	if err == nil && !account.HidePushPreviews {
		hidePreview = false
	}

	return &messengertypes.PushReceive_Reply{
		Data: &messengertypes.PushReceivedData{
			ProtocolData:      oosMessage,
			Interaction:       i,
			AlreadyReceived:   oosMessage.AlreadyReceived || !isNew,
			ConversationMuted: conversationMuted,
			AccountMuted:      accountMuted,
			HidePreview:       hidePreview,
		},
	}, nil
}
