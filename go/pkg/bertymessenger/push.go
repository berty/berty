package bertymessenger

import (
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type messengerPushReceiver struct {
	logger       *zap.Logger
	pushHandler  bertyprotocol.PushHandler
	eventHandler *eventHandler
}

type MessengerPushReceiver interface {
	PushReceive(ctx context.Context, input []byte) (*protocoltypes.PushReceive_Reply, error)
}

func NewPushReceiver(ctx context.Context, db *gorm.DB, pushHandler bertyprotocol.PushHandler, logger *zap.Logger) (MessengerPushReceiver, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	wrappedDB := newDBWrapper(db, logger)
	evtHandler := newEventHandler(ctx, wrappedDB, nil, logger, nil, false)

	return &messengerPushReceiver{
		logger:       logger,
		pushHandler:  pushHandler,
		eventHandler: evtHandler,
	}, nil
}

func (m *messengerPushReceiver) PushReceive(ctx context.Context, input []byte) (*protocoltypes.PushReceive_Reply, error) {
	clear, err := m.pushHandler.PushReceive(input)
	if err != nil {
		return nil, err
	}

	if err := m.eventHandler.handleOutOfStoreAppMessage(clear.GroupPublicKey, clear.Message, clear.Cleartext); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return clear, nil
}
