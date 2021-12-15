package bertymessenger

import (
	"errors"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type DispatcherHelper struct {
	messengerutil.Dispatcher
}

func (dh *DispatcherHelper) AccountUpdated(account *messengertypes.Account, isNew bool) error {
	if account == nil {
		return errors.New("nil account")
	}
	return dh.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: account}, isNew)
}

func (dh *DispatcherHelper) ConversationUpdated(conv *messengertypes.Conversation, isNew bool) error {
	if conv == nil {
		return errors.New("nil conversation")
	}
	return dh.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, isNew)
}
