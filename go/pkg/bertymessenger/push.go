package bertymessenger

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type messengerPushReceiver struct {
	logger       *zap.Logger
	pushHandler  bertyprotocol.PushHandler
	eventHandler *EventHandler
}

type MessengerPushReceiver interface {
	PushReceive(ctx context.Context, input []byte) (*messengertypes.PushReceive_Reply, error)
}

func NewPushReceiver(pushHandler bertyprotocol.PushHandler, evtHandler *EventHandler, logger *zap.Logger) MessengerPushReceiver {
	if logger == nil {
		logger = zap.NewNop()
	}

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
		Data: &messengertypes.PushReceivedData{
			ProtocolData: clear,
			Interaction:  i,
		},
	}, nil
}
