package bertymessenger

import (
	"context"
	"errors"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) NotificationSetEnabled(ctx context.Context, req *messengertypes.NotificationSetEnabled_Request) (reply *messengertypes.NotificationSetEnabled_Reply, err error) {
	endSection := tyber.SimpleSection(ctx, s.logger, "NotificationSetEnabled")
	defer func() { endSection(err) }()

	if req == nil {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("nil request"))
	}

	s.handlerMutex.Lock()
	defer s.handlerMutex.Unlock()

	updated, err := s.db.NotificationSetEnabled(req.Value)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if updated {
		s.dispatcher.SetShouldNotify(req.Value)
		if err := s.dispatchDBAccount(false); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	return &messengertypes.NotificationSetEnabled_Reply{}, nil
}

func (s *service) NotificationConversationSetEnabled(ctx context.Context, req *messengertypes.NotificationConversationSetEnabled_Request) (reply *messengertypes.NotificationConversationSetEnabled_Reply, err error) {
	endSection := tyber.SimpleSection(ctx, s.logger, "NotificationConversationSetEnabled")
	defer func() { endSection(err) }()

	if req == nil {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("nil request"))
	}

	if req.ConversationPublicKey == "" {
		return nil, errcode.ErrInvalidInput.Wrap(errors.New("empty conversation public key"))
	}

	s.handlerMutex.Lock()
	defer s.handlerMutex.Unlock()

	updated, err := s.db.NotificationConversationSetEnabled(req.ConversationPublicKey, req.Value)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if updated {
		if err := s.dispatchDBConversation(req.ConversationPublicKey, false); err != nil {
			return nil, errcode.ErrInternal.Wrap(err)
		}
	}

	return &messengertypes.NotificationConversationSetEnabled_Reply{}, nil
}
