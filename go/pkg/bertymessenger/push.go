package bertymessenger

import (
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type messengerPushReceiver struct {
	logger       *zap.Logger
	pushHandler  bertyprotocol.PushHandler
	eventHandler *eventHandler
}

type MessengerPushReceiver interface {
	PushReceive(ctx context.Context, input []byte) (*messengertypes.PushReceive_Reply, error)
}

func NewPushReceiver(ctx context.Context, db *gorm.DB, pushHandler bertyprotocol.PushHandler, logger *zap.Logger) MessengerPushReceiver {
	if logger == nil {
		logger = zap.NewNop()
	}

	wrappedDB := newDBWrapper(db, logger)
	evtHandler := newEventHandler(ctx, wrappedDB, nil, logger, nil, false)

	return &messengerPushReceiver{
		logger:       logger,
		pushHandler:  pushHandler,
		eventHandler: evtHandler,
	}
}

func (m *messengerPushReceiver) PushReceive(ctx context.Context, input []byte) (*messengertypes.PushReceive_Reply, error) {
	clear, err := m.pushHandler.PushReceive(input)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	i, err := m.eventHandler.handleOutOfStoreAppMessage(clear.GroupPublicKey, clear.Message, clear.Cleartext)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &messengertypes.PushReceive_Reply{
		ProtocolData: clear,
		Interaction:  i,
	}, nil
}
