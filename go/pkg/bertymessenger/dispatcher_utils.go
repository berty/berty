package bertymessenger

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func (s *service) dispatchDBConversation(convPK string, isNew bool) error {
	conv, err := s.db.GetConversationByPK(convPK)
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}
	return s.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeConversationUpdated, &messengertypes.StreamEvent_ConversationUpdated{Conversation: conv}, isNew)
}

func (s *service) dispatchDBAccount(isNew bool) error {
	account, err := s.db.GetAccount()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}
	return s.dispatcher.StreamEvent(messengertypes.StreamEvent_TypeAccountUpdated, &messengertypes.StreamEvent_AccountUpdated{Account: account}, isNew)
}
